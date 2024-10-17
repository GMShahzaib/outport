import express, { NextFunction, Request } from 'express';
import { APIDocumentation, Endpoint } from './schema.js';
import { getAbsoluteFSPath } from './public/absolute-path.js';

export interface SchemaApi {
  name: string;
  endpoints: Endpoint[];
}

class Outport {
  private values: APIDocumentation;
  private apis: SchemaApi[];

  constructor(values: APIDocumentation) {
    this.values = values;
    this.apis = [];
    this.swaggerInitFn = this.swaggerInitFn.bind(this);
  }

  public use(name: string, endpoints: Endpoint[]): void {
    const obj = this.apis.find((item) => item.name == name);
    if (obj) {
      obj.endpoints = [...obj.endpoints, ...endpoints];
    } else {
      this.apis.push({ name, endpoints });
    }
  }

  private outportTPLString = `
    <% apiOptions %>

    export default options
  `;

  private stringify(obj: { apis: SchemaApi[]; values: APIDocumentation }) {
    return 'const options = ' + JSON.stringify(obj) + ';';
  }

  private swaggerInitFn(req: Request, res: any, next: NextFunction) {
    const url = req.url && req.url.split('?')[0];


    if (url.endsWith('/absolute-path.js')) {
      res.sendStatus(404);
    }else if (url.endsWith('/outport-des-init.js')) {
      res.set('Content-Type', 'application/javascript');
      res.send(this.outportTPLString.replace('<% apiOptions %>', this.stringify({ apis: this.apis, values: this.values })));
    } else{
      next();
    }
  }

  public serve(): [(req: Request, resp: any, next: NextFunction) => void, express.Handler] {
    return [this.swaggerInitFn, express.static(getAbsoluteFSPath())];
  }
}

export default Outport;
