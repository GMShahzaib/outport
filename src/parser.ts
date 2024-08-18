import { APIDocumentation, Endpoint } from './schema';

export class SchemaParser {
  private schema: APIDocumentation;

  constructor(schema: APIDocumentation) {
    this.schema = schema;
  }

  public parse(): string {
    return JSON.stringify(this.schema, null, 2);
  }
}

export interface SchemaApi { name: string, endpoints: Endpoint[] }
