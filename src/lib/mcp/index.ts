import { defineMcp } from "@lovable.dev/mcp-js";
import searchProjectsTool from "./tools/search-projects";
import getProjectTool from "./tools/get-project";
import listRecentProjectsTool from "./tools/list-recent-projects";

export default defineMcp({
  name: "resona-mcp",
  title: "Resona MCP",
  version: "0.1.0",
  instructions:
    "Tools for Resona, a decentralized social network for science. Use `search_projects` to find public research projects by keyword or tag, `list_recent_projects` to browse the newest posts, and `get_project` to read a project's full content and interaction counts.",
  tools: [searchProjectsTool, getProjectTool, listRecentProjectsTool],
});
