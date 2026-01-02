import * as z from "zod";
import { tool } from "langchain";
import { gitVersion, getGitStatus, getCurrentBranch, squashMerge } from "./git";

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
  ),

  // Git current branch tool
  gitCurrentBranchTool: tool(
    async () => {
      const branch = await getCurrentBranch();
      return branch;
    },
    {
      name: "git_current_branch",
      description: "Get the current git branch name",
      schema: z.object({}),
    },
  ),

  // Git squash merge tool
  gitSquashMergeTool: tool(
    async ({ sourceBranch, targetBranch, commitMessage, confirm }) => {
      return await squashMerge({
        sourceBranch,
        targetBranch,
        commitMessage,
        confirm,
      });
    },
    {
      name: "git_squash_merge",
      description:
        "Perform a safe squash merge from a source branch into a target branch after confirmation",
      schema: z.object({
        sourceBranch: z.string().optional(),
        targetBranch: z.string().optional(),
        commitMessage: z.string(),
        confirm: z.string(),
      }),
    },
  ),
  
};
