import express, { NextFunction, Request, Response } from 'express';
import { APIDocumentation, Endpoint } from './schema.js';
import { fileURLToPath } from 'url';
import path from 'path';

export interface SchemaApi {
  name: string;
  endpoints: Endpoint[];
}

class Outport {
  #values: APIDocumentation;
  #apis: SchemaApi[];

  /**
   * Constructor for creating an instance of Outport.
   * @param {APIDocumentation} values - The initial documentation object that contains details like title, version, servers, headers, and description.
   * @throws Will throw an error if the input `values` does not meet the validation criteria.
   */
  constructor(values: APIDocumentation) {
    this.#validateConstructorValues(values);
    this.#values = { ...values, playground: values.playground !== undefined ? values.playground : true, };
    this.#apis = [];
    // this.#swaggerInitFn = this.#swaggerInitFn.bind(this);
  }

  /**
   * Validates the values passed to the constructor.
   * @param {APIDocumentation} values - The documentation values to validate.
   * @throws Will throw an error if any of the input values are invalid.
   */
  #validateConstructorValues(values: APIDocumentation): void {
    if (typeof values.title !== 'string' || values.title.trim().length === 0) {
      throw new Error("Invalid 'title': must be a non-empty string.");
    }

    if (typeof values.version !== 'string' || values.version.trim().length === 0) {
      throw new Error("Invalid 'version': must be a non-empty string.");
    }

    if (values.servers && (!Array.isArray(values.servers) || !values.servers.every(s => typeof s === 'string'))) {
      throw new Error("Invalid 'servers': must be a non-empty array of strings.");
    }

    if (values.headers && (!Array.isArray(values.headers) || !values.headers.every(header => {
      return typeof header.key === 'string' && header.key.trim().length > 0 &&
        typeof header.value === 'string';
    }))) {
      throw new Error("Invalid 'headers': each header must have a non-empty 'key' and a 'value' as strings.");
    }

    if (typeof values.description !== 'string' || values.description.trim().length === 0) {
      throw new Error("Invalid 'description': must be a non-empty string.");
    }

    if (values.timeout !== undefined) {
      if (typeof values.timeout !== 'number' || values.timeout <= 0) {
        throw new Error("Invalid 'timeout': must be a positive number if provided.");
      }
    }

    if (values.playground !== undefined && typeof values.playground !== 'boolean') {
      throw new Error("Invalid 'playground': must be a boolean if provided.");
    }
  }

  /**
   * Adds a new API schema with specified endpoints.
   * @param {string} name - The name of the API schema.
   * @param {Endpoint[]} endpoints - An array of endpoint objects.
   * @throws Will throw an error if the `name` is invalid or `endpoints` do not meet the validation criteria.
   */
  public use(name: string, endpoints: Endpoint[]): void {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new Error("Invalid 'name': must be a non-empty string.");
    }

    if (!Array.isArray(endpoints)) {
      throw new Error("Invalid 'endpoints': must be a array.");
    }

    endpoints.forEach((endpoint, index) => {
      this.#validateEndpoint(endpoint, index);
    });

    const obj = this.#apis.find((item) => item.name == name);
    if (obj) {
      obj.endpoints = [...obj.endpoints, ...endpoints];
    } else {
      this.#apis.push({ name, endpoints });
    }
  }

  /**
   * Validates an individual endpoint object.
   * @param {Endpoint} endpoint - The endpoint object to validate.
   * @param {number} index - The index of the endpoint in the array.
   * @throws Will throw an error if the endpoint properties do not meet the validation criteria.
   */
  #validateEndpoint(endpoint: Endpoint, index: number): void {
    if (typeof endpoint.path !== 'string' || endpoint.path.trim().length === 0) {
      throw new Error(`Invalid 'path' at index ${index}: must be a non-empty string.`);
    }

    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    if (!validMethods.includes(endpoint.method)) {
      throw new Error(`Invalid 'method' at index ${index}: must be one of ${validMethods.join(', ')}.`);
    }

    if (typeof endpoint.summary !== 'string') {
      throw new Error(`Invalid 'summary' at index ${index}: must be a string.`);
    }

    if (endpoint.body) {
      if (typeof endpoint.body.type !== 'string' || !['json', 'form'].includes(endpoint.body.type)) {
        throw new Error(`Invalid 'body.type' at index ${index}: must be 'json' or 'form'.`);
      }

      if (!Array.isArray(endpoint.body.data)) {
        throw new Error(`Invalid 'body.data' at index ${index}: must be an array.`);
      }
    }

    if (endpoint.headers && (!Array.isArray(endpoint.headers) || !endpoint.headers.every(header => {
      return typeof header.key === 'string' && header.key.trim().length > 0 &&
        typeof header.value === 'string';
    }))) {
      throw new Error(`Invalid 'headers' at index ${index}: each header must have a non-empty 'key' and a 'value' as strings.`);
    }

    if (endpoint.parameters && (!Array.isArray(endpoint.parameters) || !endpoint.parameters.every(param => {
      return typeof param.key === 'string' && param.key.trim().length > 0 &&
        typeof param.value === 'string'
    }))) {
      throw new Error(`Invalid 'parameters' at index ${index}: each parameter must have a non-empty 'key', a 'value'.`);
    }

    if (endpoint.responses && !Array.isArray(endpoint.responses)) {
      throw new Error(`Invalid 'responses' at index ${index}: must be a array.`);
    }

    endpoint.responses && endpoint.responses.forEach((response, responseIndex) => {
      if (typeof response.status !== 'number') {
        throw new Error(`Invalid 'status' in 'responses' at index ${index}, response ${responseIndex}: must be a number.`);
      }

      if (typeof response.description !== 'string' || response.description.trim().length === 0) {
        throw new Error(`Invalid 'description' in 'responses' at index ${index}, response ${responseIndex}: must be a non-empty string.`);
      }

      if (response.headers) {
        if (!Array.isArray(response.headers) || !response.headers.every(header => {
          return typeof header.key === 'string' && header.key.trim().length > 0 &&
            typeof header.value === 'string';
        })) {
          throw new Error(`Invalid 'headers' in 'responses' at index ${index}, response ${responseIndex}: each header must have a non-empty 'key' and a 'value' as strings.`);
        }
      }
    });
  }

  #outportTPLString = `
    <% apiOptions %>

    export default options
  `;

  /**
   * Converts an object to a string representation for exporting.
   * @param {object} obj - The object to convert.
   * @returns {string} - The stringified object.
   */
  #stringify(obj: { apis: SchemaApi[]; values: APIDocumentation }) {
    return 'const options = ' + JSON.stringify(obj) + ';';
  }

  /**
   * Middleware function for initializing Swagger documentation.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @param {NextFunction} next - The next middleware function.
   */
  #swaggerInitFn(req: Request, res: Response, next: NextFunction) {
    const url = req.url && req.url.split('?')[0];

    if (url.endsWith('/outport-des-init.js')) {
      res.set('Content-Type', 'application/javascript');
      res.send(this.#outportTPLString.replace('<% apiOptions %>', this.#stringify({ apis: this.#apis, values: this.#values })));
    } else {
      next();
    }
  }

  #cspMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      'Content-Security-Policy',
      "script-src 'self' 'unsafe-inline';"
    );
    next();
  }

  /**
   * Serves the middleware for handling requests and serving static files.
   * @returns {[express.Handler, express.Handler]} - An array with the middleware function and the static file handler.
   */
  public serve(): [(req: Request, resp: any, next: NextFunction) => void, (req: Request, resp: any, next: NextFunction) => void, express.Handler] {
    const filename = fileURLToPath(import.meta.url);
    const dirname = path.dirname(filename);
    const staticFilesPath = path.resolve(dirname, 'public');

    return [
      this.#cspMiddleware, (req, res, next) => this.#swaggerInitFn(req, res, next), express.static(staticFilesPath)];
  }
}

export default Outport;
