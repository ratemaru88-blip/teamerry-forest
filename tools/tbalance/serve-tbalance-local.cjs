const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(process.argv[2] || path.join(__dirname, "..", ".."));
const host = process.argv[3] || "127.0.0.1";
const port = Number(process.argv[4] || 8788);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".mp3", "audio/mpeg"],
  [".wav", "audio/wav"],
  [".webm", "video/webm"],
  [".mp4", "video/mp4"],
]);

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function resolveRequestPath(reqUrl) {
  const url = new URL(reqUrl, `http://${host}:${port}/`);
  const decodedPath = decodeURIComponent(url.pathname);
  const cleanPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = path.resolve(root, `.${cleanPath}`);

  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  return filePath;
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "Method Not Allowed");
    return;
  }

  let filePath;
  try {
    filePath = resolveRequestPath(req.url);
  } catch {
    send(res, 400, "Bad Request");
    return;
  }

  if (!filePath) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError) {
      send(res, 404, "Not Found");
      return;
    }

    const target = stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    fs.readFile(target, (readError, buffer) => {
      if (readError) {
        send(res, 404, "Not Found");
        return;
      }

      res.writeHead(200, {
        "Content-Type": contentTypes.get(path.extname(target).toLowerCase()) || "application/octet-stream",
        "Content-Length": buffer.length,
        "Cache-Control": "no-store",
      });
      if (req.method === "HEAD") {
        res.end();
      } else {
        res.end(buffer);
      }
    });
  });
});

server.listen(port, host);
