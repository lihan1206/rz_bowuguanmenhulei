import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "dist");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};

function proxyApi(req, res) {
  const proxy = http.request(
    {
      hostname: "backend",
      port: 8000,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    },
  );

  proxy.on("error", (error) => {
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ detail: error.message }));
  });

  req.pipe(proxy, { end: true });
}

const server = http.createServer((req, res) => {
  const url = req.url || "/";

  if (url.startsWith("/api/")) {
    proxyApi(req, res);
    return;
  }

  const reqPath = decodeURIComponent(url.split("?")[0]);
  const absPath = path.join(root, reqPath === "/" ? "/index.html" : reqPath);

  fs.readFile(absPath, (err, data) => {
    if (err) {
      fs.readFile(path.join(root, "index.html"), (indexErr, indexData) => {
        if (indexErr) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(indexData);
      });
      return;
    }

    res.setHeader("Content-Type", mime[path.extname(absPath)] || "application/octet-stream");
    res.end(data);
  });
});

server.listen(80, "0.0.0.0", () => {
  console.log("frontend server ready on port 80");
});
