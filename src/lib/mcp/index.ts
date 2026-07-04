import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchProjectsTool from "./tools/search-projects";
import getProjectTool from "./tools/get-project";
import listRecentProjectsTool from "./tools/list-recent-projects";
import resonateProjectTool from "./tools/resonate-project";
import forkProjectTool from "./tools/fork-project";

// The OAuth issuer MUST be the direct Supabase host, built from the project ref
// (never SUPABASE_URL, which is the .lovable.cloud proxy on Cloud apps).
// import.meta.env.VITE_SUPABASE_PROJECT_ID is inlined by Vite at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "resona-mcp",
  title: "Resona MCP",
  version: "0.2.0",
  instructions:
    "Tools for Resona, a decentralized social network for science. Read tools (`search_projects`, `list_recent_projects`, `get_project`) work over public data. Write tools (`resonate_project`, `fork_project`) act as the signed-in user: `resonate_project` amplifies or unamplifies a project, and `fork_project` evolves a project into a new derivative owned by the user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchProjectsTool,
    getProjectTool,
    listRecentProjectsTool,
    resonateProjectTool,
    forkProjectTool,
  ],
});
