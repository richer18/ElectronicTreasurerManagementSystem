import subprocess
import sys
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def run_git(*args):
    return subprocess.run(
        ["git", *args],
        cwd=str(ROOT),
        text=True,
        capture_output=True,
        check=False,
    )


def has_unmerged_paths():
    result = run_git("status", "--porcelain")
    return any(line.startswith(("UU", "AA", "DD", "AU", "UA", "DU", "UD")) for line in result.stdout.splitlines())


def has_uncommitted_changes():
    result = run_git("status", "--porcelain")
    return any(line.strip() for line in result.stdout.splitlines())


def has_staged_changes():
    result = run_git("diff", "--cached", "--quiet")
    return result.returncode == 1


def current_branch():
    result = run_git("branch", "--show-current")
    return result.stdout.strip() or "main"


def ensure_safe_repo_state():
    if has_unmerged_paths():
        print("Cannot continue: the repository has unmerged paths.")
        print("Resolve conflicts or run: git merge --abort")
        return False
    return True


def print_network_hint():
    print("Unable to reach GitHub.")
    print("Check your internet connection, firewall, proxy, or GitHub access.")


def print_push_prerequisites(branch):
    print("Cannot continue: you have local changes that are not committed yet.")
    print("This script only pushes existing commits to GitHub.")
    print("Run these first from the project root:")
    print("  git add .")
    print(f'  git commit -m "Update on {branch}"')
    print(f"  git push origin {branch}")


def pull_latest():
    if not ensure_safe_repo_state():
        return 1

    branch = current_branch()
    result = run_git("pull", "origin", branch)
    sys.stdout.write(result.stdout)
    sys.stderr.write(result.stderr)
    if result.returncode != 0 and "Failed to connect to github.com" in result.stderr:
        print_network_hint()
    return result.returncode


def stage_commit_changes(branch):
    if not has_uncommitted_changes():
        print("No local changes to commit.")
        return 0

    add_result = run_git("add", "-A")
    sys.stdout.write(add_result.stdout)
    sys.stderr.write(add_result.stderr)
    if add_result.returncode != 0:
        return add_result.returncode

    if not has_staged_changes():
        print("No staged changes to commit.")
        return 0

    commit_message = f"Auto-commit on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    print(f'Creating commit on "{branch}": {commit_message}')
    commit_result = run_git("commit", "-m", commit_message)
    sys.stdout.write(commit_result.stdout)
    sys.stderr.write(commit_result.stderr)
    return commit_result.returncode


def push_local():
    if not ensure_safe_repo_state():
        return 1

    branch = current_branch()
    commit_result = stage_commit_changes(branch)
    if commit_result != 0:
        return commit_result

    result = run_git("push", "origin", branch)
    sys.stdout.write(result.stdout)
    sys.stderr.write(result.stderr)
    if result.returncode != 0 and "Failed to connect to github.com" in result.stderr:
        print_network_hint()
    elif result.returncode == 0:
        print(f'Successfully pushed "{branch}" to GitHub.')
    return result.returncode


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in {"pull", "push"}:
        print("Usage: python git_sync.py [pull|push]")
        return 1

    if sys.argv[1] == "pull":
        return pull_latest()
    return push_local()


if __name__ == "__main__":
    raise SystemExit(main())
