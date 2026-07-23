from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import json
from datetime import datetime

API_KEY = "5b8a275ec36c4ec3819dea22cc6dc9cc"
ATPT_OFCDC_SC_CODE = "J10"
SD_SCHUL_CODE = "7679119"

class MealProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path != "/meal":
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not found")
            return

        params = parse_qs(parsed.query)
        ymd = params.get("date", [datetime.now().strftime("%Y%m%d")])[0]
        url = (
            "https://open.neis.go.kr/hub/mealServiceDietInfo"
            f"?Type=json&ATPT_OFCDC_SC_CODE={ATPT_OFCDC_SC_CODE}"
            f"&SD_SCHUL_CODE={SD_SCHUL_CODE}&MLSV_YMD={ymd}&KEY={API_KEY}"
        )

        try:
            request = Request(url, headers={"Accept": "application/json"})
            with urlopen(request, timeout=20) as response:
                payload = response.read().decode("utf-8")
        except HTTPError as exc:
            payload = json.dumps({"RESULT": {"CODE": f"HTTP-{exc.code}", "MESSAGE": str(exc)}})
        except URLError as exc:
            payload = json.dumps({"RESULT": {"CODE": "NETWORK-ERROR", "MESSAGE": str(exc)}})

        body = payload.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return

if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 8001), MealProxyHandler)
    print("Serving meal proxy on http://127.0.0.1:8001/meal")
    server.serve_forever()
