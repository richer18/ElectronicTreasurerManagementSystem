import subprocess
import time
from datetime import datetime
from pathlib import Path

REPO_FOLDERS = [
    Path(r"D:\WINDOWS_INSTALLED\ElectronicTreasurerManagementSystem"),
]

CHECK_INTERVAL_SECONDS = 60


def run_git(folder, *args, capture_output=False):
    return subprocess.run(
        ["git", "-C", str(folder), *args],
        check=True,
        text=True,
        capture_output=capture_output,
    )


def is_git_repo(folder):
    return (folder / ".git").exists()


def get_current_branch(folder):
    result = run_git(folder, "branch", "--show-current", capture_output=True)
    branch = result.stdout.strip()
    if not branch:
        raise RuntimeError(f"Unable to determine current branch for {folder}")
    return branch


def get_ahead_behind_counts(folder, branch):
    result = run_git(
        folder,
        "rev-list",
        "--left-right",
        "--count",
        f"{branch}...origin/{branch}",
        capture_output=True,
    )
    ahead, behind = map(int, result.stdout.strip().split())
    return ahead, behind


def update_from_github(folder):
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Checking: {folder}")

    if not folder.exists():
        print(f"Skipped: folder does not exist: {folder}")
        return

    if not is_git_repo(folder):
        print(f"Skipped: not a Git repository: {folder}")
        return

    branch = get_current_branch(folder)

    run_git(folder, "fetch", "origin", branch)
    ahead, behind = get_ahead_behind_counts(folder, branch)

    if behind == 0 and ahead == 0:
        print("Already up to date.")
        return

    if ahead > 0 and behind == 0:
        print(f"Local branch is ahead by {ahead} commit(s). Push your changes instead of pulling.")
        return

    if ahead > 0 and behind > 0:
        print(
            f"Local and remote have diverged (ahead {ahead}, behind {behind}). Resolve manually before auto-update."
        )
        return

    print(f"Remote is ahead by {behind} commit(s). Pulling changes...")
    run_git(folder, "pull", "--ff-only", "origin", branch)
    print("Updated successfully.")


while True:
    for folder in REPO_FOLDERS:
        try:
            update_from_github(folder)
        except (subprocess.CalledProcessError, RuntimeError) as error:
            print(f"Error in {folder}: {error}")
    time.sleep(CHECK_INTERVAL_SECONDS)
