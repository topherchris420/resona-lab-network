import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

function publicSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_project",
  title: "Get project",
  description:
    "Fetch full details for a single public research project by its id, including content, tags, links, resonance and fork counts, and comments.",
  inputSchema: {
    id: z.string().trim().min(1).describe("The project id (UUID)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }) => {
    const supabase = publicSupabase();

    const { data: project, error } = await supabase
      .from("projects")
      .select("id, title, abstract, content, tags, github_url, dataset_url, author_id, source_project_id, created_at, updated_at")
      .eq("id", id)
      .eq("visibility", "public")
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!project) return { content: [{ type: "text", text: "Project not found or not public." }], isError: true };

    const [{ count: resonanceCount }, { count: forkCount }, { data: comments }] = await Promise.all([
      supabase.from("project_resonances").select("user_id", { count: "exact", head: true }).eq("project_id", id),
      supabase.from("project_forks").select("id", { count: "exact", head: true }).eq("source_project_id", id),
      supabase.from("project_comments").select("id, content, created_at").eq("project_id", id).order("created_at", { ascending: true }),
    ]);

    const result = {
      ...project,
      resonance_count: resonanceCount ?? 0,
      fork_count: forkCount ?? 0,
      comments: comments ?? [],
    };

    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: { project: result },
    };
  },
});
