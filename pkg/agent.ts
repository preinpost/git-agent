import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";  // 명시적 import
import tool from "./tool";
import { buildSystemPrompt } from "./prompts";
import { getCurrentBranch, getGitStatus } from "./git";

export async function createGitAgent() {
  const currentBranch = await getCurrentBranch();
  const gitStatusOutput = await getGitStatus();

  return createAgent({
    model: new ChatOpenAI({ model: "gpt-4o-mini" }),  // 인스턴스 전달
    systemPrompt: buildSystemPrompt({
      currentBranch,
      gitStatusOutput,
    }),
    tools: [
      tool.gitVersionTool,
      tool.gitStatusTool,
      tool.gitCurrentBranchTool,
      tool.gitSquashMergeTool,
    ],
  });
}
