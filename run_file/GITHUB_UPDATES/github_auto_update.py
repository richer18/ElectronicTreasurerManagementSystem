import subprocess
import time
from datetime import datetime

# List of local GitHub repositories to check
folders = [
    r"C:\xampp\htdocs\ElectronicTreasurerManagementSystem",
    r"C:\xampp\htdocs\frontend"
]

branch = "main"  # Change to 'master' if your repo uses that

def update_from_github(folder):
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Checking: {folder}")
    try:
        # Fetch latest commits from remote
        subprocess.run(["git", "-C", folder, "fetch"], check=True)

        # Get latest commit hashes for local and remote
        local_commit = subprocess.check_output(
            ["git", "-C", folder, "rev-parse", branch]
        ).strip()
        remote_commit = subprocess.check_output(
            ["git", "-C", folder, "rev-parse", f"origin/{branch}"]
        ).strip()

        if local_commit != remote_commit:
            print("🚨 Update found! Pulling changes...")
            subprocess.run(["git", "-C", folder, "pull"], check=True)
            print("✅ Updated successfully!")
        else:
            print("✅ Already up-to-date.")

    except subprocess.CalledProcessError as e:
        print(f"❌ Error in {folder}: {e}")

# Check every 60 seconds
while True:
    for folder in folders:
        update_from_github(folder)
    time.sleep(60)  # Check again in 1 minute
