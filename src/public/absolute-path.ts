import path from "path";
import { fileURLToPath } from "url";

/*
 * getAbsoluteFSPath
 * @return {string} When run in NodeJS env, returns the absolute path to the current directory
 *                  When run outside of NodeJS, will return an error message
 */
export function getAbsoluteFSPath() {
  // detect whether we are running in a browser or Node.js
  if (typeof process !== "undefined" && process.versions && process.versions.node) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const staticFilesPath = path.resolve(__dirname);

    if (!staticFilesPath) {
      throw new Error('Static files path is not defined');
    }

    return staticFilesPath;
  }
  throw new Error('getAbsoluteFSPath can only be called within a Node.js environment');
}
