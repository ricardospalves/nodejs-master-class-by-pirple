import { handlers } from "./handlers/index.js";

// Define a request router
export const router = {
  ping: handlers.ping,
  users: handlers.users,
};
