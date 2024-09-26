import { createServer } from "node:http";
import url from "node:url";

const PORT = 3000;

const server = createServer((request, response) => {
  // Get the URL and parse it
  const parsedUrl = url.parse(request.url, true);

  // Get the path
  const pathname = parsedUrl.pathname;
  const trimedPathname = pathname.replace(/^\/+|\/+$/g, "");

  // Log the request path
  console.log("Request received on path:", trimedPathname);

  return response.end("Hello World!");
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
