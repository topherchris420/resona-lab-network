import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

function publicSupabase() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "search_projects",
  title: "Search projects",
  description:
    "Search public research projects on Resona by keyword. Matches the title and abstract, optionally filtered by a tag. Returns the most recent matches.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Keyword to search titles and abstracts for."),
    tag: z.string().trim().optional().describe("Optional tag to filter results by."),
    limit: z.number().int().min(1).max(50).optional().describe("Maximum results to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, tag, limit }) => {
    const supabase = publicSupabase();
    // Commas and parentheses are PostgREST .or() syntax, and \ % _ are ILIKE
    // wildcards — neutralize both so the keyword is matched literally.
    const keyword = query.replace(/[,()]/g, " ").replace(/[\\%_]/g, "\\$&").trim();
    let request = supabase
      .from("projects")
      .select("id, title, abstract, tags, author_id, created_at")
      .eq("visibility", "public")
      .or(`title.ilike.%${keyword}%,abstract.ilike.%${keyword}%`)
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);

    if (tag) request = request.contains("tags", [tag]);

    const { data, error } = await request;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { projects: data ?? [] },
    };
  },
});
