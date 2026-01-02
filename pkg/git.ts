import { $ } from "bun";

export async function gitVersion() {
    return await $`git --version`.text();
}

export async function getGitStatus() {
  // --porcelain 옵션은 파싱하기 쉬운 포맷으로 출력해줍니다.
  const statusText = await $`git status --porcelain`.text();
  
  if (!statusText) return "Clean working directory";
  return statusText;
}


export async function getCurrentBranch() {
  const branchName = await $`git branch --show-current`.text();
  return branchName.trim();
}


export async function gitCommit(message: string) {
  try {
    await $`git add .`;
    // 텍스트는 자동으로 이스케이프 처리되어 안전합니다.
    await $`git commit -m ${message}`;
    return "Commit successful";
  } catch (err: any) {
    // 커밋할 게 없거나 에러 발생 시 처리
    return `Error: ${err.stderr.toString()}`;
  }
}