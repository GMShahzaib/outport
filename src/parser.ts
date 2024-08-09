import { APIDocumentation } from './schema';

export class SchemaParser {
  private schema: APIDocumentation;

  constructor(schema: APIDocumentation) {
    this.schema = schema;
  }

  public parse(): string {
    // Process and return a string representation (or object) of the parsed schema
    return JSON.stringify(this.schema, null, 2); // For now, just returning a formatted JSON string
  }
}
