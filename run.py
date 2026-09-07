from __future__ import annotations

import os
from pathlib import Path
import secrets
import shutil
import subprocess
import sys
import time
import urllib.request


ROOT = Path(__file__).resolve().parent
BACKEND_REQUIREMENTS = ROOT / "backend" / "requirements.txt"
FRONTEND_DIR = ROOT / "frontend"
ENV_FILE = ROOT / ".env"
ENV_EXAMPLE = ROOT / ".env.example"
VENV_DIR = ROOT / "venv" if (ROOT / "venv").exists() else ROOT / ".venv"


def log(message: str) -> None:
    print(f"[FoodChow] {message}", flush=True)


def python_path() -> Path:
    return VENV_DIR / ("Scripts/python.exe" if os.name == "nt" else "bin/python")


def ensure_python_environment() -> None:
    interpreter = python_path()
    if not interpreter.exists():
        log(f"Creating Python environment at {VENV_DIR}")
        subprocess.check_call([sys.executable, "-m", "venv", str(VENV_DIR)], cwd=ROOT)

    if Path(sys.executable).resolve() != interpreter.resolve():
        log("Re-launching with the project Python environment")
        result = subprocess.run([str(interpreter), str(Path(__file__).resolve()), *sys.argv[1:]], cwd=ROOT)
        raise SystemExit(result.returncode)


def ensure_backend_dependencies() -> None:
    log("Checking backend dependencies")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(BACKEND_REQUIREMENTS)], cwd=ROOT)


def ensure_frontend_dependencies() -> None:
    npm = shutil.which("npm")
    if npm is None:
        raise RuntimeError("Node.js/npm was not found. Install Node.js 18+ and run `python run.py` again.")

    package_lock = FRONTEND_DIR / "package-lock.json"
    node_modules = FRONTEND_DIR / "node_modules"
    if not node_modules.exists() or (package_lock.exists() and package_lock.stat().st_mtime > node_modules.stat().st_mtime):
        log("Installing frontend dependencies with npm ci")
        command = [npm, "ci"] if package_lock.exists() else [npm, "install"]
        subprocess.check_call(command, cwd=FRONTEND_DIR)
    else:
        log("Frontend dependencies are already installed")


def read_env_file() -> dict[str, str]:
    values: dict[str, str] = {}
    if not ENV_FILE.exists():
        if not ENV_EXAMPLE.exists():
            raise RuntimeError("No .env or .env.example file exists at the project root.")
        shutil.copyfile(ENV_EXAMPLE, ENV_FILE)
        log("Created .env from .env.example")

    for raw_line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")

    if not values.get("JWT_SECRET_KEY"):
        secret = secrets.token_urlsafe(32)
        with ENV_FILE.open("a", encoding="utf-8") as env_file:
            env_file.write(f"\nJWT_SECRET_KEY={secret}\n")
        values["JWT_SECRET_KEY"] = secret
        log("Generated a local JWT secret in .env")

    os.environ.update(values)
    return values


def verify_configuration(values: dict[str, str]) -> None:
    missing = []
    if not values.get("MONGODB_URI"):
        missing.append("MONGODB_URI (MongoDB Atlas connection string)")
    if not values.get("GEMINI_API_KEY"):
        missing.append("GEMINI_API_KEY (required for Gemini-powered chat)")
    if missing:
        log("Configuration warnings: " + "; ".join(missing))
        log("The API will start, but database-backed authentication/chat features need these values.")


def wait_for_backend(url: str, timeout: float = 30.0) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                return response.status == 200
        except OSError:
            time.sleep(0.25)
    return False


def port_is_in_use(host: str, port: int) -> bool:
    import socket

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as connection:
        connection.settimeout(0.25)
        return connection.connect_ex((host, port)) == 0


def terminate(processes: list[subprocess.Popen]) -> None:
    for process in processes:
        if process.poll() is None:
            process.terminate()
    for process in processes:
        if process.poll() is None:
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()


def main() -> int:
    if sys.version_info < (3, 11):
        raise RuntimeError("Python 3.11 or newer is required.")

    ensure_python_environment()
    ensure_backend_dependencies()
    ensure_frontend_dependencies()
    values = read_env_file()
    verify_configuration(values)

    backend_host = values.get("BACKEND_HOST", "127.0.0.1")
    backend_port = int(values.get("BACKEND_PORT", "8000"))
    frontend_host = "127.0.0.1"
    frontend_port = int(values.get("FRONTEND_PORT", "5173"))
    if port_is_in_use(backend_host, backend_port):
        raise RuntimeError(
            f"Backend port {backend_port} is already in use. Stop the existing FoodChow instance before restarting."
        )
    if port_is_in_use("127.0.0.1", frontend_port):
        raise RuntimeError(
            f"Frontend port {frontend_port} is already in use. Stop the existing FoodChow instance before restarting."
        )
    env = os.environ.copy()
    env["PYTHONPATH"] = str(ROOT) + os.pathsep + env.get("PYTHONPATH", "")
    env["FRONTEND_URL"] = f"http://{frontend_host}:{frontend_port}"

    backend = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", backend_host, "--port", str(backend_port)],
        cwd=ROOT,
        env=env,
    )
    frontend = None
    processes = [backend]
    try:
        health_url = f"http://{backend_host}:{backend_port}/health"
        if not wait_for_backend(health_url):
            raise RuntimeError("Backend did not become healthy. Check the backend log above.")
        log(f"Backend: http://{backend_host}:{backend_port}")

        npm = shutil.which("npm")
        frontend = subprocess.Popen(
            [npm, "run", "dev", "--", "--host", frontend_host, "--port", str(frontend_port)],
            cwd=FRONTEND_DIR,
            env=env,
        )
        processes.append(frontend)
        frontend_url = f"http://{frontend_host}:{frontend_port}"
        log(f"Frontend: {frontend_url}")
        time.sleep(1)
        log("Press Ctrl+C to stop both services.")

        while True:
            if backend.poll() is not None:
                raise RuntimeError(f"Backend exited with code {backend.returncode}.")
            if frontend.poll() is not None:
                raise RuntimeError(f"Frontend exited with code {frontend.returncode}.")
            time.sleep(0.5)
    except KeyboardInterrupt:
        log("Stopping services")
        return 0
    finally:
        terminate(processes)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"[FoodChow] Startup failed: {exc}", file=sys.stderr)
        raise SystemExit(1)