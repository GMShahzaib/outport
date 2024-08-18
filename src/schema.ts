export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface Response {
  status: number;
  description: string;
}

export interface Endpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  summary: string;
  description?: string;
  parameters?: Parameter[];
  responses: Response[];
}

export interface APIDocumentation {
  title: string;
  version: string;
  basePath: string;
}
