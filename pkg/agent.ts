import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";  // 명시적 import
import tool from "./tool";
import { SYSTEM_PROMPT } from "./prompts";

export const agent = createAgent({
    model: new ChatOpenAI({ model: "gpt-4o-mini" }),  // 인스턴스 전달
    systemPrompt: SYSTEM_PROMPT,
    tools: [tool.gitVersionTool, tool.gitStatusTool],
});