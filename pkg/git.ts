import { $ } from "bun";

const MAINLINE_BRANCHES = new Set(["main", "master", "develop"]);

export async function gitVersion() {
    return await $`git --version`.text();
}

export async function getGitStatusPorcelain() {
  return (await $`git status --porcelain`.text()).trim();
}

export async function getGitStatus() {
  // --porcelain 옵션은 파싱하기 쉬운 포맷으로 출력해줍니다.
  const statusText = await getGitStatusPorcelain();
  
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

type SquashMergeOptions = {
  sourceBranch?: string;
  targetBranch?: string;
  commitMessage: string;
  confirm: string;
};

export async function squashMerge({
  sourceBranch,
  targetBranch,
  commitMessage,
  confirm,
}: SquashMergeOptions) {
  const currentBranch = await getCurrentBranch();

  if (!currentBranch) {
    return "현재 브랜치를 확인할 수 없습니다. 브랜치 상태를 확인해주세요.";
  }

  if (MAINLINE_BRANCHES.has(currentBranch)) {
    return "현재 메인 브랜치에 있습니다. 기능 브랜치로 이동하거나 브랜치명을 확인해주세요.";
  }

  const statusOutput = await getGitStatusPorcelain();
  if (statusOutput) {
    return "커밋되지 않은 변경 사항이 있어 브랜치 이동이 위험합니다. 먼저 커밋하거나 Stash 해주세요.";
  }

  if (!confirm || confirm.trim().toUpperCase() !== "YES") {
    return "최종 확인이 필요합니다. confirm 값으로 YES를 전달해주세요.";
  }

  const resolvedSourceBranch = (sourceBranch?.trim() || currentBranch).trim();
  const resolvedTargetBranch = (targetBranch?.trim() || "main").trim();
  const resolvedCommitMessage = commitMessage.trim();

  if (!resolvedCommitMessage) {
    return "커밋 메시지가 비어 있습니다. commitMessage 값을 확인해주세요.";
  }

  if (resolvedSourceBranch === resolvedTargetBranch) {
    return "소스 브랜치와 타겟 브랜치가 같습니다. 서로 다른 브랜치를 지정해주세요.";
  }

  try {
    await $`git checkout ${resolvedTargetBranch}`;
  } catch (err: any) {
    return `타겟 브랜치로 이동 실패: ${err.stderr?.toString() || err.message}`;
  }

  try {
    await $`git pull origin ${resolvedTargetBranch}`;
  } catch (err: any) {
    return `타겟 브랜치 최신화 실패: ${err.stderr?.toString() || err.message}`;
  }

  try {
    await $`git merge --squash ${resolvedSourceBranch}`;
  } catch (err: any) {
    return `Squash merge 중 충돌이 발생했습니다. 충돌을 해결한 뒤 다시 진행해주세요.\n${err.stderr?.toString() || err.message}`;
  }

  try {
    await $`git commit -m ${resolvedCommitMessage}`;
  } catch (err: any) {
    return `Squash merge 커밋 실패: ${err.stderr?.toString() || err.message}`;
  }

  try {
    await $`git push origin ${resolvedTargetBranch}`;
  } catch (err: any) {
    return `타겟 브랜치 푸시 실패: ${err.stderr?.toString() || err.message}`;
  }

  try {
    await $`git branch -D ${resolvedSourceBranch}`;
  } catch (err: any) {
    return `소스 브랜치 삭제 실패: ${err.stderr?.toString() || err.message}`;
  }

  return `✅ Squash merge 완료 (${resolvedSourceBranch} -> ${resolvedTargetBranch})`;
}
