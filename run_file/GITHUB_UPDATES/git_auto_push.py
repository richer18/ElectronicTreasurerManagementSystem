import os
import subprocess
from datetime import datetime

# Define the folders
folders = [
    r"C:\xampp\htdocs\ElectronicTreasurerManagementSystem",
    r"C:\xampp\htdocs\ElectronicTreasurerManagementSystem\frontend"
]


def run_git_commands(folder):
    print(f"\nProcessing folder: {folder}")
    os.chdir(folder)

    # Stage all changes
    subprocess.run(["git", "add", "-A"], check=True)

    # Check if there are staged changes
    # return code 0: no staged changes, 1: staged changes
    staged_check = subprocess.run(["git", "diff", "--cached", "--quiet"])
    if staged_check.returncode == 0:
        print(f"No changes to commit in: {folder}")
        return
    if staged_check.returncode not in (0, 1):
        raise subprocess.CalledProcessError(staged_check.returncode, staged_check.args)

    commit_message = f"Auto-commit on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    subprocess.run(["git", "commit", "-m", commit_message], check=True)

    # Push to origin
    subprocess.run(["git", "push", "origin", "main"], check=True)  # Change to "master" if needed

    print(f"Successfully pushed: {folder}")


for folder in folders:
    try:
        run_git_commands(folder)
    except subprocess.CalledProcessError as e:
        print(f"Error in {folder}: {e}")

print("\nAll done!")
