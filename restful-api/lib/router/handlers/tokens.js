import { data as _data } from "../../data.js";
import { helpers } from "../../helper.js";

const RANDOM_STRING_LENGTH = 20;

// Container for all tokens methods
const _tokens = {
  // POST
  // Required data: phone, password
  // Optional data: none
  post(data, callback) {
    const payload = data?.payload;

    const phone =
      typeof payload?.phone === "string" && payload.phone.trim().length === 10
        ? payload.phone.trim()
        : false;

    const password =
      typeof payload?.password === "string" &&
      payload.password.trim().length > 0
        ? payload.password.trim()
        : false;

    if (!phone || !password) {
      return callback(400, {
        error: "Missing required field(s).",
      });
    }

    // Lookup the user who matches that phone number
    _data.read("users", phone, (error, userData) => {
      if (error || !userData) {
        return callback(404, {
          error: "Could not find the specified user.",
        });
      }

      // Hash the sent password and compare it to the password stored in the user object.
      const hashedPassword = helpers.hash(password);

      if (hashedPassword !== userData.hashedPassword) {
        return callback(400, {
          error: `Password did not match the specified user's stored password.`,
        });
      }

      // If valid, create a new token with a random name. Set expiration date 1 hour in the future.
      const tokenId = helpers.createRandomString(RANDOM_STRING_LENGTH);
      const expires = Date.now() + 100 * 60 * 60;
      const tokenObject = {
        id: tokenId,
        phone,
        expires,
      };

      // Store the token
      _data.create("tokens", tokenId, tokenObject, (error) => {
        if (error) {
          return callback(500, {
            error: "Could not create the new token.",
          });
        }

        callback(200, tokenObject);
      });
    });
  },

  // GET
  // Required data: id
  // Optional data: none
  get(data, callback) {
    // Check that the id is valid
    const id =
      typeof data.queryStringObject.id === "string" &&
      data.queryStringObject.id.trim().length === RANDOM_STRING_LENGTH
        ? data.queryStringObject.id.trim()
        : false;

    if (!id) {
      return callback(400, {
        error: "Missing required field.",
      });
    }

    // Look up the token
    _data.read("tokens", id, (error, tokenData) => {
      if (error || !tokenData) {
        return callback(404);
      }

      return callback(200, tokenData);
    });
  },

  // PUT
  // Required data: id, extend
  // Optional data: none
  put(data, callback) {
    const id =
      typeof data.payload.id === "string" &&
      data.payload.id.trim().length === RANDOM_STRING_LENGTH
        ? data.payload.id.trim()
        : false;

    const extend = data.payload.extend === true || false;

    if (!id || !extend) {
      return callback(400, {
        error: "Missign required field(s) or field(s) are invalid.",
      });
    }

    // Lookup the token
    _data.read("tokens", id, (error, tokenData) => {
      if (error || !tokenData) {
        return callback(400, {
          error: "Specified token does not exist.",
        });
      }

      // Check to the make sure the token isn't already expired.
      if (tokenData.expires <= Date.now()) {
        return callback(400, {
          error: "The token has already expired and cannot be extended.",
        });
      }

      // Set the expiration an hour from now
      tokenData.expires = Date.now() + 1000 * 60 * 60;

      // Store the new update
      _data.update("tokens", id, tokenData, (error) => {
        if (error) {
          return callback(500, {
            error: `Could not update the token's expiration.`,
          });
        }

        return callback(200);
      });
    });
  },

  // DELETE
  // Required data: id
  // Optional data: none
  delete(data, callback) {
    // Check that ID is valid
    const id =
      typeof data.queryStringObject.id === "string" &&
      data.queryStringObject.id.trim().length === RANDOM_STRING_LENGTH
        ? data.queryStringObject.id.trim()
        : false;

    if (!id) {
      return callback(400, {
        error: "Missing required field.",
      });
    }

    // Look up the token
    _data.read("tokens", id, (readArgument) => {
      console.log(readArgument.error);

      if (readArgument.error) {
        return callback(404, {
          error: "Could not find the specified token.",
        });
      }

      _data.delete("tokens", id, (deleteArgument) => {
        if (deleteArgument.error) {
          return callback(500, {
            error: "Could not delete the specified token.",
          });
        }

        return callback(200);
      });
    });
  },
};

export const tokens = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];

  console.log("[token]", data.method);

  if (!acceptableMethods.includes(data.method)) {
    return callback(405);
  }

  return _tokens[data.method](data, callback);
};
