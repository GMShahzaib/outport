export interface Parameter {
  key: string;
  value: string;
  description?: string;
}
export interface Header {
  key: string;
  value: string;
  description?: string;
}
export interface BodyData {
  key: string,
  value?: string | number,
  description?: string;
  type: "text" | 'file'
}
export interface Response {
  status: number;
  description: string;
  value?: string;
  headers?: Header[]
}

export interface Endpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  summary: string;
  description?: string;
  body?: { type: 'json' | 'form', data: BodyData[] },
  headers?: Header[];
  parameters?: Parameter[];
  responses: Response[];
}

export interface APIDocumentation {
  title: string;
  version: string;
  servers: string[];
  headers?: Header[]
  description: string;
  timeout?: number
}
