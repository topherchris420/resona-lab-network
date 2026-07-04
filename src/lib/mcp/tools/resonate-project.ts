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
  name: "resonate_project",
  title: "Resonate with a project",
  description:
    "Resonate with (like/amplify) a public research project as the signed-in user, or remove your resonance. Returns the project's updated resonance count.",
  inputSchema: {
    project_id: z.string().trim().min(1).describe("The project id (UUID) to resonate with."),
    resonate: z
      .boolean()
      .optional()
      .describe("true to resonate (default), false to remove an existing resonance."),
  },
  annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ project_id, resonate }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated." }], isError: true };
    }

    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    const shouldResonate = resonate ?? true;

    if (shouldResonate) {
      const { error } = await supabase
        .from("project_resonances")
        .upsert({ project_id, user_id: userId });
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    } else {
      const { error } = await supabase
        .from("project_resonances")
        .delete()
        .eq("project_id", project_id)
        .eq("user_id", userId);
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const { count } = await supabase
      .from("project_resonances")
      .select("user_id", { count: "exact", head: true })
      .eq("project_id", project_id);

    const result = {
      project_id,
      has_resonated: shouldResonate,
      resonance_count: count ?? 0,
    };

    return {
      content: [
        {
          type: "text",
          text: `${shouldResonate ? "Resonated with" : "Removed resonance from"} project ${project_id}. Total resonances: ${count ?? 0}.`,
        },
      ],
      structuredContent: result,
    };
  },
});
