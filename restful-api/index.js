import http from "node:http";
import https from "node:https";
import url from "node:url";
import { StringDecoder } from "node:string_decoder";
import fs from "node:fs";
import config from "./config.js";

const HTTP_PORT = config.httpPort;
const HTTPS_PORT = config.httpsPort;

// Define the handlers
const handlers = {};

// Ping handler
handlers.ping = (data, callback) => {
  // Callback a http status code and a payload object
  callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404, {
    message: "Route not found.",
  });
};

// Define a request router
const router = {
  ping: handlers.ping,
};

// Instantiate the HTTP server
const httpServer = http.createServer(unifiedServer);

// Start the server
httpServer.listen(HTTP_PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${HTTP_PORT}`);
});

// Instantiate the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};

const httpsServer = https.createServer(httpsServerOptions, unifiedServer);

// Start the https server
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`🚀 Server is running on https://localhost:${HTTPS_PORT}`);
});

// All the server logic for both the http server
function unifiedServer(request, response) {
  // Get the URL and parse it
  const parsedUrl = url.parse(request.url, true);

  // Get the path
  const pathname = parsedUrl.pathname;
  const trimmedPathname = pathname.replace(/^\/+|\/+$/g, "");

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the HTTP method
  const method = request.method.toLowerCase();

  // Get headers as an object
  const headersObject = request.headers;

  // Get the paylod, if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  request.on("data", (chunk) => {
    buffer += decoder.write(chunk);
  });

  request.on("end", () => {
    buffer += decoder.end();

    // Log the request path
    console.log("Pathname:", trimmedPathname);
    console.log("Method:", method);
    console.log("Query:", queryStringObject);
    console.log("Headers:", headersObject);
    console.log("Payload:", buffer);

    // Choose the handler this request should go to. Is one is not found, use the notFound handler
    const chosenHandler = router[trimmedPathname]
      ? router[trimmedPathname]
      : handlers.notFound;

    console.log("[chosen]", chosenHandler);

    // Construct the data object to send to the handler
    const data = {
      trimmedPathname,
      queryStringObject,
      method,
      headersObject,
      payload: buffer,
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload) {
      // Use the statusCode called back by the handler, or default to 200
      statusCode = typeof statusCode === "number" ? statusCode : 200;

      // Use the payload called bu the handler, or default to an empty object
      payload = typeof payload === "object" ? payload : {};

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // Return the response
      response.setHeader("Content-Type", "application/json");
      response.writeHead(statusCode);
      response.end(payloadString);

      console.log("Returning this response:", statusCode, payloadString);
    });
  });
}
