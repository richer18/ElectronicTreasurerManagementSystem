import json
import os
import signal
import socket
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"
STATE_FILE = Path(__file__).resolve().with_name("server_processes.json")
XAMPP_DIR = Path(r"C:\xampp")
APACHE_START = XAMPP_DIR / "apache_start.bat"
APACHE_STOP = XAMPP_DIR / "apache_stop.bat"
MYSQL_START = XAMPP_DIR / "mysql_start.bat"
MYSQL_STOP = XAMPP_DIR / "mysql_stop.bat"


def save_state(processes):
    STATE_FILE.write_text(json.dumps(processes, indent=2), encoding="utf-8")


def load_state():
    if not STATE_FILE.exists():
        return {}
    return json.loads(STATE_FILE.read_text(encoding="utf-8"))


def start_process(command, cwd):
    creationflags = 0
    if os.name == "nt":
        creationflags = subprocess.CREATE_NEW_CONSOLE

    if os.name == "nt" and command and command[0].lower() == "npm":
        # On Windows, `npm start` is more reliable when launched through cmd.
        # This preserves the process tree so `taskkill /T` can stop it later.
        command = ["cmd", "/c", *command]

    process = subprocess.Popen(
        command,
        cwd=str(cwd),
        creationflags=creationflags,
    )
    return process.pid


def run_batch_file(path):
    if not path.exists():
        print(f"Skipped missing script: {path}")
        return

    subprocess.run(
        ["cmd", "/c", str(path)],
        check=False,
        cwd=str(path.parent),
    )


def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def start_servers():
    if load_state():
        print("Server processes already recorded. Stop them first if needed.")
        return 1

    if is_port_in_use(80):
        print("XAMPP Apache appears to be running already on port 80. Skipping start.")
    else:
        print("Starting XAMPP Apache...")
        run_batch_file(APACHE_START)

    if is_port_in_use(3306):
        print("XAMPP MySQL appears to be running already on port 3306. Skipping start.")
    else:
        print("Starting XAMPP MySQL...")
        run_batch_file(MYSQL_START)

    backend_pid = start_process(
        ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8001"],
        BACKEND_DIR,
    )
    frontend_pid = start_process(["npm", "start"], FRONTEND_DIR)

    save_state(
        {
            "xampp_apache_script": str(APACHE_STOP),
            "xampp_mysql_script": str(MYSQL_STOP),
            "backend": backend_pid,
            "frontend": frontend_pid,
        }
    )

    print(f"Backend server started. PID: {backend_pid}")
    print(f"Frontend server started. PID: {frontend_pid}")
    print("Use stop_server.bat to stop both processes.")
    return 0


def stop_pid(pid):
    if os.name == "nt":
        subprocess.run(
            ["taskkill", "/PID", str(pid), "/T", "/F"],
            check=False,
            capture_output=True,
            text=True,
        )
    else:
        os.kill(pid, signal.SIGTERM)


def stop_servers():
    processes = load_state()
    if not processes:
        print("No recorded app server processes found.")
    else:
        for name, pid in processes.items():
            if not str(name).startswith("xampp_"):
                print(f"Stopping {name} (PID {pid})...")
                stop_pid(pid)

    if is_port_in_use(80):
        print("Stopping XAMPP Apache...")
        run_batch_file(APACHE_STOP)
    else:
        print("XAMPP Apache is not listening on port 80. Skipping stop.")

    if is_port_in_use(3306):
        print("Stopping XAMPP MySQL...")
        run_batch_file(MYSQL_STOP)
    else:
        print("XAMPP MySQL is not listening on port 3306. Skipping stop.")

    if STATE_FILE.exists():
        STATE_FILE.unlink()

    print("Server processes stopped.")
    return 0


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in {"start", "stop"}:
        print("Usage: python server_control.py [start|stop]")
        return 1

    if sys.argv[1] == "start":
        return start_servers()
    return stop_servers()


if __name__ == "__main__":
    raise SystemExit(main())
