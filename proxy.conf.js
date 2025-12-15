module.exports = {
  "/server": {
    target: "http://127.0.0.1:8080",
    changeOrigin: false,
    secure: false,
    xfwd: true,
    headers: {
      "Host": "localhost:1234",
      "X-Forwarded-Host": "localhost:1234",
      "X-Forwarded-Proto": "https",
      "X-Forwarded-Port": "1234"
    },
    cookieDomainRewrite: "localhost",
    cookiePathRewrite: "/",
    logLevel: "debug",

    // We will handle the response only for JSON. Others must be piped through!
    selfHandleResponse: true,
    onProxyRes(proxyRes, req, res) {
      // Always fix redirect Location (if any)
      if (proxyRes.headers["location"]) {
        proxyRes.headers["location"] =
          proxyRes.headers["location"]
            .replace(/https?:\/\/10\.100\.10\.192(?::\d+)?/g, "https://localhost:1234")
            .replace(/http:\/\/localhost:8080/g, "https://localhost:1234");
      }

      const ct = (proxyRes.headers["content-type"] || "").toLowerCase();

      const isJson =
        ct.includes("application/json") ||
        ct.includes("application/hal+json") ||
        ct.includes("application/x-spring-data-compact+json");

      if (!isJson) {
        // NOT JSON → just stream the response through to the browser
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
        return;
      }

      // JSON/HAL → buffer, rewrite absolute URLs, then send
      const chunks = [];
      proxyRes.on("data", (c) => chunks.push(c));
      proxyRes.on("end", () => {
        try {
          let body = Buffer.concat(chunks).toString("utf8");
          body = body
            .replace(/https?:\/\/10\.100\.10\.192(?::\d+)?/g, "https://localhost:1234")
            .replace(/http:\/\/localhost:8080/g, "https://localhost:1234");
          const buf = Buffer.from(body, "utf8");
          // forward headers (fix content-length)
          const headers = { ...proxyRes.headers, "content-length": Buffer.byteLength(buf) };
          res.writeHead(proxyRes.statusCode || 200, headers);
          res.end(buf);
        } catch {
          // on any error, fall back to original body
          res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
          res.end(Buffer.concat(chunks));
        }
      });
    }
  }
};

