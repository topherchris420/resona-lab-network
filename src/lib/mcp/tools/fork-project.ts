import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Runs Supabase as the signed-in agent user so RLS applies to every write.
function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "fork_project",
  title: "Fork a project",
  description:
    "Fork (evolve) a public research project as the signed-in user. Creates a new derivative project owned by the user and records the fork link back to the source. Returns the new project id.",
  inputSchema: {
    project_id: z.string().trim().min(1).describe("The source project id (UUID) to fork."),
    title: z
      .string()
      .trim()
      .optional()
      .describe("Optional title for the fork. Defaults to 'Fork of <original title>'."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ project_id, title }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const { data: source, error: sourceError } = await supabase
      .from("projects")
      .select("id, title, abstract, content, tags, github_url, dataset_url")
      .eq("id", project_id)
      .eq("visibility", "public")
      .maybeSingle();

    if (sourceError) return { content: [{ type: "text", text: sourceError.message }], isError: true };
    if (!source) {
      return { content: [{ type: "text", text: "Source project not found or not public." }], isError: true };
    }

    const { data: created, error: createError } = await supabase
      .from("projects")
      .insert({
        author_id: userId,
        title: (title?.trim() || `Fork of ${source.title}`).slice(0, 255),
        abstract: source.abstract,
        content: source.content,
        tags: source.tags,
        github_url: source.github_url,
        dataset_url: source.dataset_url,
        source_project_id: source.id,
      })
      .select("id")
      .single();

    if (createError) return { content: [{ type: "text", text: createError.message }], isError: true };

    const { error: forkError } = await supabase.from("project_forks").insert({
      source_project_id: source.id,
      forked_project_id: created.id,
      author_id: userId,
    });

    if (forkError) return { content: [{ type: "text", text: forkError.message }], isError: true };

    const result = {
      source_project_id: source.id,
      forked_project_id: created.id,
    };

    return {
      content: [
        {
          type: "text",
          text: `Forked project ${source.id} into new project ${created.id}.`,
        },
      ],
      structuredContent: result,
    };
  },
});
