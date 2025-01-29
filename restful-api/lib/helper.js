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

  // Create a string of random alphanumeric characters, of a given length
  createRandomString(stringLength) {
    if (typeof stringLength !== "number" || stringLength <= 0) {
      return false;
    }

    // Define all the possible characters that could go into a string
    const possibleCharacters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    // Start the final string
    let string = "";

    for (let i = 0; i < stringLength; i++) {
      // Get a random character from the `possibleCharacters` string
      const character = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );

      // Append this character to the final string
      string += character;
    }

    return string;
  },
};
