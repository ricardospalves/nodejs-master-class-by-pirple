import { handlers } from "./handlers/index.js";

// Define a request router
export const router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  notFound(data, callback) {
    return callback(404, {
      message: "Route not found.",
    });
  },
};
