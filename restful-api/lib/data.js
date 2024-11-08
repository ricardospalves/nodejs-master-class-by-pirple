/**
 * Library to storing and editing data.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { helpers } from "./helper.js";

export const data = {
  // Base directory of data folder
  get baseDirectory() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    return path.join(__dirname, "/../.data");
  },

  // Write data to a file
  create(directory, file, data, callback) {
    // Open the file for writing
    fs.open(
      `${this.baseDirectory}/${directory}/${file}.json`,
      "wx",
      (error, fileDescriptor) => {
        if (error) {
          callback("Could not create new file, it may already exist.");

          return;
        }

        // Convert data to string
        const stringData = JSON.stringify(data);

        // Write to file and close it
        fs.writeFile(fileDescriptor, stringData, (error) => {
          if (error) {
            callback("Error writing to new file.");
            return;
          }

          fs.close(fileDescriptor, (error) => {
            if (error) {
              callback("Error closing new file.");
              return;
            }

            callback(false);
          });
        });
      }
    );
  },

  // Read data from a file
  read(directory, file, callback) {
    fs.readFile(
      `${this.baseDirectory}/${directory}/${file}.json`,
      "utf-8",
      (error, data) => {
        const parsedData = helpers.parseJSONToObject(data);

        if (error && !data) {
          return callback(error, data);
        }

        return callback(false, parsedData);
      }
    );
  },

  // Update data inside a file
  update(directory, file, data, callback) {
    // Open the file for writing
    fs.open(
      `${this.baseDirectory}/${directory}/${file}.json`,
      "r+",
      (error, fileDescriptor) => {
        if (error) {
          callback("Could not open the file for updating, it may exist yet.");
          return;
        }

        // Convert data to string
        const stringData = JSON.stringify(data);

        // Truncate the file
        fs.ftruncate(fileDescriptor, (error) => {
          if (error) {
            callback("Error truncating file.");
            return;
          }

          fs.writeFile(fileDescriptor, stringData, (error) => {
            if (error) {
              callback("Error writing to exist file.");
              return;
            }

            // Write to the file and close it
            fs.close(fileDescriptor, (error) => {
              if (error) {
                callback("Error closing existing file.");
              }

              callback(false);
            });
          });
        });
      }
    );
  },

  // Delete a file
  delete(directory, file, callback) {
    // Unlink the file
    fs.unlink(`${this.baseDirectory}/${directory}/${file}.json`, (error) => {
      if (error) {
        callback("Error deleting file.");
        return;
      }
    });
  },
};
