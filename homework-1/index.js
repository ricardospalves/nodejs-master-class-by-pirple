import http from "node:http";
import url from "node:url";

const handlers = {
  hello: (callback) => {
    callback(200, {
      message: "Hello, welcome!",
    });
  },
  notFound: (callback) => {
    callback(404, {
      message: "Route not found.",
    });
  },
};

const router = {
  hello: handlers.hello,
  notFound: handlers.notFound,
};

const server = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const pathname = parsedUrl.pathname;
  const trimmedPathname = pathname.replace(/^\/+|\/+$/g, "");
  const chosenHandler =
    trimmedPathname in router ? router[trimmedPathname] : router.notFound;

  return chosenHandler((statusCode, payload) => {
    statusCode = typeof statusCode === "number" ? statusCode : 200;
    payload = typeof payload === "object" ? payload : {};

    const payloadString = JSON.stringify(payload);

    response.setHeader("Content-Type", "application/json");
    response.writeHead(statusCode);

    return response.end(payloadString);
  });
});

server.listen(3000, () => {
  console.log(`🚀 Server is running on https://localhost:3000`);
});
