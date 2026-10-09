"""
MAX / Myraa Windows Desktop Companion Bridge
Runs locally on Windows PC to launch Google Chrome, websites, and Windows applications via voice.
Port: 5005 (or configured)
"""
import os
import sys
import json
import subprocess
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 5005

# Approved Windows applications whitelist
ALLOWED_APPS = {
    "chrome": ["chrome.exe"],
    "google chrome": ["chrome.exe"],
    "notepad": ["notepad.exe"],
    "calculator": ["calc.exe"],
    "calc": ["calc.exe"],
    "explorer": ["explorer.exe"],
    "file explorer": ["explorer.exe"],
    "taskmgr": ["taskmgr.exe"],
    "task manager": ["taskmgr.exe"],
    "paint": ["mspaint.exe"],
    "mspaint": ["mspaint.exe"],
    "cmd": ["cmd.exe", "/c", "start", "cmd.exe"],
    "terminal": ["cmd.exe", "/c", "start", "cmd.exe"],
    "powershell": ["powershell.exe"],
    "vscode": ["code"],
    "vs code": ["code"],
    "snippingtool": ["snippingtool.exe"],
    "control": ["control.exe"],
}

def find_chrome_path():
    candidates = [
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return "chrome.exe"  # Fallback to PATH

CHROME_PATH = find_chrome_path()

class BridgeHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            data = {
                "status": "ok",
                "platform": sys.platform,
                "chrome_path": CHROME_PATH,
                "chrome_available": os.path.exists(CHROME_PATH) if CHROME_PATH != "chrome.exe" else True,
                "supported_apps": list(ALLOWED_APPS.keys()),
            }
            self.wfile.write(json.dumps(data).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8")
        
        try:
            body = json.loads(post_data) if post_data else {}
        except Exception:
            body = {}

        self.send_response(200)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.end_headers()

        response = {"success": False, "message": "Unknown endpoint"}

        if self.path == "/launch-chrome" or self.path == "/api/launch-chrome":
            url = body.get("url")
            search = body.get("search")
            engine = body.get("engine", "google")
            
            target_url = "https://www.google.com"
            if url:
                target_url = url if url.startswith("http") else "https://" + url
            elif search:
                if engine == "youtube":
                    target_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(search)}"
                else:
                    target_url = f"https://www.google.com/search?q={urllib.parse.quote(search)}"

            try:
                subprocess.Popen([CHROME_PATH, target_url], shell=False)
                response = {
                    "success": True,
                    "message": f"Successfully launched Chrome with {target_url}",
                    "url": target_url,
                }
            except Exception as e:
                response = {"success": False, "error": str(e)}

        elif self.path == "/launch-app" or self.path == "/api/launch-app":
            app_name = body.get("app", "").lower().strip()
            if app_name in ALLOWED_APPS:
                cmd = ALLOWED_APPS[app_name]
                try:
                    subprocess.Popen(cmd, shell=False)
                    response = {
                        "success": True,
                        "app": app_name,
                        "message": f"Successfully launched {app_name}",
                    }
                except Exception as e:
                    response = {"success": False, "error": str(e)}
            else:
                response = {
                    "success": False,
                    "error": f"App '{app_name}' is not in the approved whitelist.",
                }

        elif self.path == "/play-song" or self.path == "/api/play-song":
            song = body.get("song", "")
            target_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(song + ' official song')}"
            try:
                subprocess.Popen([CHROME_PATH, target_url], shell=False)
                response = {
                    "success": True,
                    "message": f"Playing song '{song}' on YouTube via Chrome",
                    "url": target_url,
                }
            except Exception as e:
                response = {"success": False, "error": str(e)}

        elif self.path == "/close-tab" or self.path == "/api/close-tab":
            # On Windows, send Ctrl+W to active window
            try:
                ps_script = """
                $wshell = New-Object -ComObject wscript.shell;
                $wshell.SendKeys('^w');
                """
                subprocess.run(["powershell", "-Command", ps_script], check=True)
                response = {"success": True, "message": "Closed current tab in Chrome"}
            except Exception as e:
                response = {"success": False, "error": str(e)}

        self.wfile.write(json.dumps(response).encode("utf-8"))

def run():
    server_address = ("127.0.0.1", PORT)
    httpd = HTTPServer(server_address, BridgeHandler)
    print(f"=====================================================")
    print(f"  MAX / Myraa Windows Desktop Bridge Started")
    print(f"  Listening on: http://127.0.0.1:{PORT}")
    print(f"  Chrome Executable: {CHROME_PATH}")
    print(f"  Ready for voice commands from MAX Assistant!")
    print(f"=====================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Windows Bridge...")
        httpd.server_close()

if __name__ == "__main__":
    run()
