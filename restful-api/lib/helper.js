/**
 * Helpers for various tasks.
 */
import { createHmac } from "node:crypto";
import config from "./config.js";

// Container for all the helpers.
export const helpers = {
  // Create a SHA256 hash.
  hash(value) {
    if (typeof value !== "string" || value.length === 0) {
      return false;
    }

    const hash = createHmac("sha256", config.hashingSecret)
      .update(value)
      .digest("hex");

    return hash;
  },

  // Parse a JSON string to an object in all cases, withour throwing.
  parseJSONToObject(value) {
    try {
      const object = JSON.parse(value);

      return object;
    } catch (error) {
      return {};
    }
  },
};
