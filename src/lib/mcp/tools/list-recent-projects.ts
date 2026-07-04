import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

function publicSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_recent_projects",
  title: "List recent projects",
  description:
    "List the most recently published public research projects on Resona, newest first. Useful for seeing what the community is working on right now.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Maximum results to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = publicSupabase();
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, abstract, tags, author_id, created_at")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { projects: data ?? [] },
    };
  },
});
