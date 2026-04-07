import subprocess
from datetime import datetime
from pathlib import Path

REPO_FOLDERS = [
    Path(r"D:\WINDOWS_INSTALLED\ElectronicTreasurerManagementSystem"),
]


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


def has_staged_changes(folder):
    staged_check = subprocess.run(
        ["git", "-C", str(folder), "diff", "--cached", "--quiet"],
        text=True,
    )
    if staged_check.returncode not in (0, 1):
        raise subprocess.CalledProcessError(staged_check.returncode, staged_check.args)
    return staged_check.returncode == 1


def run_git_commands(folder):
    print(f"\nProcessing repository: {folder}")

    if not folder.exists():
        print(f"Skipped: folder does not exist: {folder}")
        return

    if not is_git_repo(folder):
        print(f"Skipped: not a Git repository: {folder}")
        return

    branch = get_current_branch(folder)

    run_git(folder, "add", "-A")

    if not has_staged_changes(folder):
        print(f"No changes to commit in: {folder}")
        return

    commit_message = f"Auto-commit on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    run_git(folder, "commit", "-m", commit_message)
    run_git(folder, "push", "origin", branch)

    print(f"Successfully pushed {branch}: {folder}")


for folder in REPO_FOLDERS:
    try:
        run_git_commands(folder)
    except (subprocess.CalledProcessError, RuntimeError) as error:
        print(f"Error in {folder}: {error}")

print("\nAll done!")
