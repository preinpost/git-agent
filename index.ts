import { createGitAgent } from "./pkg/agent";
import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";

function extractTextContent(message: unknown) {
  if (!message || typeof message !== "object") return "";
  const content = (message as { content?: unknown }).content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          const text = (part as { text?: unknown }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("");
  }
  return "";
}

async function main() {
  const userPrompt = process.argv.slice(2).join(" ").trim();

  if (!userPrompt) {
    console.log('Usage: ./git-agent "<prompt>"');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY in environment.");
    process.exit(1);
  }

  try {
    const agent = await createGitAgent();
    let messages: any[] = [
      { role: "user", content: userPrompt },
    ];

    const rl = process.stdin.isTTY
      ? createInterface({ input: stdin, output: stdout })
      : null;

    while (true) {
      const result = await agent.invoke({ messages });
      const lastMessage = result.messages[result.messages.length - 1];
      const text = extractTextContent(lastMessage);

      if (text) {
        console.log(text);
      } else {
        const fallback = [...result.messages]
          .reverse()
          .map((message) => extractTextContent(message))
          .find((value) => value);
        console.log(fallback || "No response");
      }

      if (!rl) {
        break;
      }

      const input = (await rl.question("> ")).trim();
      if (!input) {
        break;
      }

      messages = [
        ...result.messages,
        { role: "user", content: input },
      ];
    }

    if (rl) {
      rl.close();
    }
  } catch (err: any) {
    console.error(`Agent failed: ${err?.message || err}`);
    if (err?.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();
