import { agent } from "./pkg/agent";
import { getGitStatus, gitVersion } from "./pkg/git";

async function main() {

  const status = await getGitStatus();
  console.log("Direct call:", status);

  const version = await gitVersion();
  console.log("Direct call:", version);

  console.log("\n--- Agent Test ---");
  const result = await agent.invoke({
    messages: [
      { role: "user", content: "Git 버전과 현재 상태를 알려줘" },
    ],
  });

  // 마지막 AI 응답만 추출
  const lastMessage = result.messages[result.messages.length - 1];
  console.log("AI Response:", lastMessage?.content);
}

main();
