import { data as _data } from "../../data.js";
import config from "../../config.js";
import { helpers } from "../../helper.js";

// Container for all the check methods
const _checks = {
  post(data, callback) {
    const payload = data?.payload;

    // Validate inputs
    const protocol =
      typeof payload?.protocol === "string" &&
      /^http(s?)$/.test(payload.protocol)
        ? payload.protocol
        : false;

    const url =
      typeof payload?.url === "string" && payload.url.trim().length
        ? payload.url.trim()
        : false;

    const method =
      typeof payload?.method === "string" &&
      /^post|get|put|delete|$/.test(payload.method)
        ? payload.method
        : false;

    const successCodes =
      Array.isArray(payload?.successCodes) && payload.successCodes.length
        ? payload.successCodes
        : false;

    const timeoutSeconds =
      typeof payload?.timeoutSeconds === "number" &&
      payload.timeoutSeconds % 1 === 0 &&
      payload.timeoutSeconds >= 1 &&
      payload.timeoutSeconds <= 5
        ? payload.timeoutSeconds
        : false;

    if (!protocol || !url || !method || !successCodes || !timeoutSeconds) {
      return callback(400, {
        error: "Missing required inputs, or inputs are invalid.",
      });
    }

    // Get the tokens from the headers
    const token =
      typeof data?.headers?.token === "string" ? data.headers.token : false;

    // Lookup the user by reading the token
    _data.read("tokens", token, (error, tokenData) => {
      if (error || !tokenData) {
        return callback(403, {
          error: "token",
        });
      }

      const userPhone = tokenData.phone;

      // Lookup the user data
      _data.read("users", userPhone, (error, userData) => {
        if (error || !userData) {
          return callback(403, {
            error: "user",
          });
        }

        const userChecks = Array.isArray(userData?.checks)
          ? userData.checks
          : [];

        // Verify that the user has less than the number of max-checks-per-user
        if (userChecks.length >= config.maxChecks) {
          return callback(400, {
            error: `The user already has the maximum number of checks (${config.maxChecks})`,
          });
        }

        // Create a random ID for the check
        const checkId = helpers.createRandomString(20);

        // Create the check object, and include the user's phone
        const checkObject = {
          id: checkId,
          userPhone,
          protocol,
          url,
          method,
          successCodes,
          timeoutSeconds,
        };

        // Create the check
        _data.create("checks", checkId, checkObject, (error) => {
          if (error) {
            return callback(500, {
              error: "Could not create the new check.",
            });
          }

          // Add the check ID to the user's object
          userData.checks = userChecks;
          userData.checks.push(checkId);

          _data.update("users", userPhone, userData, (error) => {
            if (error) {
              return callback(500, {
                error: "Could not update the user with de new check.",
              });
            }

            return callback(200, checkObject);
          });
        });
      });
    });
  },

  get() {},
  put() {},
  delete() {},
};

export const checks = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];

  if (!acceptableMethods.includes(data.method)) {
    return callback(405);
  }

  return _checks[data.method](data, callback);
};
