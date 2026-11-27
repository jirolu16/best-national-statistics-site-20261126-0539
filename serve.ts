/**
 * Japan in Numbers - local preview server.
 *
 * A deliberately small static file server for previewing the site in
 * app/ during development. It serves only files inside app/, refuses
 * path escapes, sets a content type per extension, and never caches,
 * so what you see is always the file on disk.
 *
 * Usage: node serve.ts [PORT]     (default port 4173)
 * Then open http://localhost:4173/ in a browser.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const APP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "app");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function contentTypeFor(filePath: string): string {
  return MIME_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream";
}

/**
 * Map a request URL to a file inside APP_DIR, or return null when the
 * path would escape the directory or names nothing servable.
 */
function resolveRequestPath(urlPath: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const cleaned = normalize(decoded).replace(/^[/\\]+/, "");
  const candidate = resolve(APP_DIR, cleaned === "" ? "index.html" : cleaned);
  if (candidate !== APP_DIR && !candidate.startsWith(APP_DIR + "/")) {
    return null;
  }
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    return join(candidate, "index.html");
  }
  return candidate;
}

function send(res: ServerResponse, status: number, body: Buffer | string, type: string): void {
  const buf = typeof body === "string" ? Buffer.from(body, "utf8") : body;
  res.writeHead(status, {
    "Content-Type": type,
    "Content-Length": String(buf.length),
    "Cache-Control": "no-store",
  });
  res.end(buf);
}

function handleRequest(req: IncomingMessage, res: ServerResponse): void {
  const url = new URL(req.url || "/", "http://localhost");
  const filePath = resolveRequestPath(url.pathname);
  if (filePath === null) {
    send(res, 400, "Bad request path", "text/plain; charset=utf-8");
    return;
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    send(res, 404, "Not found: " + url.pathname, "text/plain; charset=utf-8");
    console.log("404 " + url.pathname);
    return;
  }
  const body = readFileSync(filePath);
  send(res, 200, body, contentTypeFor(filePath));
  console.log("200 " + url.pathname + " (" + body.length + " bytes)");
}

function main(): void {
  const portArg = process.argv[2];
  const port = portArg ? Number.parseInt(portArg, 10) : 4173;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("Invalid port: " + String(portArg));
    process.exit(1);
  }
  const server = createServer(handleRequest);
  server.on("error", (err) => {
    console.error("Server error: " + String(err));
    process.exit(1);
  });
  server.listen(port, () => {
    console.log("Japan in Numbers preview at http://localhost:" + port + "/");
    console.log("Serving " + APP_DIR + " - Ctrl+C to stop.");
  });
}

main();
