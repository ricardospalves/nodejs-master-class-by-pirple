import { data as _data } from "./data.js";
import { helpers } from "./helper.js";

// Define the handlers

const handlers = {};

// Users handler
handlers.users = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];

  if (acceptableMethods.includes(data.method)) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {
  // users: POST
  // Required data: firstName, lastName, phone, password, tosAgreement
  // Optional data: none
  post(data, callback) {
    const payload = data?.payload;

    // Check that all required fields are filled out
    const firstName =
      typeof payload?.firstName === "string" &&
      payload.firstName.trim().length > 0
        ? payload.firstName.trim()
        : false;

    const lastName =
      typeof payload?.lastName === "string" &&
      payload.lastName.trim().length > 0
        ? payload.lastName.trim()
        : false;

    const phone =
      typeof payload?.phone === "string" && payload.phone.trim().length === 10
        ? payload.phone.trim()
        : false;

    const password =
      typeof payload?.password === "string" &&
      payload.password.trim().length > 0
        ? payload.password.trim()
        : false;

    const tosAgreement =
      typeof payload?.tosAgreement === "boolean" ? payload.tosAgreement : false;

    if (!(firstName && lastName && phone && password && tosAgreement)) {
      return callback(400, {
        error: "Missing required fields.",
      });
    }

    // Make sute that the user doesn't already exist.
    _data.read("users", phone, (error, data) => {
      if (!error) {
        return callback(400, {
          error: "A user with that phone number already exists.",
        });
      }

      // Hash the password
      const hashedPassword = helpers.hash(password);

      if (!hashedPassword) {
        callback(500, {
          error: `Could not hash the user's password.`,
        });
      }

      // Create the user object
      const userObject = {
        firstName,
        lastName,
        phone,
        hashedPassword,
        tosAgreement: true,
      };

      // Store the user
      _data.create("users", phone, userObject, (error) => {
        if (error) {
          return callback(500, {
            error: "Could not create the new user.",
          });
        }

        callback(200);
      });
    });
  },

  // users: GET
  // Required data: phone
  // Optional data: none
  // @TODO Only let an authenticated user access their object. Don't let them access anyone else.
  get(data, callback) {
    // Check that the phone number is valid
    const phone =
      typeof data.queryStringObject.phone === "string" &&
      data.queryStringObject.phone.trim().length === 10
        ? data.queryStringObject.phone.trim()
        : false;

    if (!phone) {
      return callback(400, {
        error: "Missing required field.",
      });
    }

    // Look up the user
    _data.read("users", phone, (error, data) => {
      if (error || !data) {
        return callback(404);
      }

      // Remove the hashed password from the user object before returning it to the requester.
      delete data.hashedPassword;

      return callback(200, data);
    });
  },
};

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

export { handlers };
