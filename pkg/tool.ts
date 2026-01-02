import * as z from "zod";
import { tool } from "langchain";
import { gitVersion, getGitStatus } from "./git";

export default {

  // Git version tool
  gitVersionTool: tool(
    async () => {
      const version = await gitVersion();
      return version;
    },
    {
      name: "git_version",
      description: "Get the current git version",
      schema: z.object({}),
    },
  ),

  // Git status tool
  gitStatusTool: tool(
    async () => {
      const status = await getGitStatus();
      return status;
    },
    {
      name: "git_status",
      description: "Get the current git repository status",
      schema: z.object({}),
    },
  )
  
};