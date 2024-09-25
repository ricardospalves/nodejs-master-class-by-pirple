import { createServer } from "node:http";

const PORT = 3000;

const server = createServer((request, response) => {
  return response.end("Hello World!");
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
