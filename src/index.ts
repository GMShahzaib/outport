import express, { NextFunction, Request } from 'express'

import { SchemaApi, SchemaParser } from './parser.js';
import { APIDocumentation, Endpoint } from './schema.js';
import { getAbsoluteFSPath } from './public/absolute-path.js';

class Outport {
  private parser: SchemaParser;
  private apis: SchemaApi[];


  constructor(schema: APIDocumentation) {
    this.parser = new SchemaParser(schema);
    this.apis = [];

    this.swaggerInitFn = this.swaggerInitFn.bind(this);
  }

  public use(name: string, endpoints: Endpoint[]): void {
    this.apis.push({ name, endpoints });
  }

  private outportTPLString = `
  window.onload = function() {
    // Build a system

    // it will be replaced by "const options = []"
    <% apiOptions %>

    const outportUI = document.getElementById("outport-ui");

    outportUI.innerHTML = options.map(({ name, endpoints }) => buildApiSection(name, endpoints)).join('');

    function buildApiSection(name, endpoints) {
      const categoryId = uidGenerator();
      return \`
        <section>
          <div class="collapsible-main">
            <div class="clickable ptb-10" onclick="toggleContent('\${categoryId}')">
              <span class="collection-name">\${name}</span>
            </div>
            <div id="\${categoryId}" class="endpoints">
              \${endpoints.map(endpoint => buildEndpointSection(endpoint)).join('')}
            </div>
          </div>
        </section>
      \`;
    }

    function buildEndpointSection(endpoint) {
      const endpointId = uidGenerator();
      return \`
        <div class="collapsible" onclick="toggleContent('\${endpointId}')">
          <div class="flex clickable ptb-5">
            <div class="http-method \${endpoint.method.toLowerCase()}">\${endpoint.method}</div>
            <div class="endpoint-path">\${endpoint.path}</div>
            <div class="endpoint-summary">\${endpoint.summary}</div>
          </div>
          <div id="\${endpointId}" class="endpoint">
            \${endpoint.description ? buildDescription(endpoint.description) : ""}
            \${endpoint.parameters ? buildParameters(endpoint.parameters) : ""}
            \${endpoint.responses ? buildResponses(endpoint.responses) : ""}
          </div>
        </div>
      \`;
    }

    function uidGenerator() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    function buildDescription(description) {
      return \`<p><strong>Description:</strong> \${description}</p>\`;
    }

    function buildParameters(parameters) {
      return \`
        <h4>Parameters:</h4>
        <ul>
          \${parameters.map(param => buildParameterSection(param)).join('')}
        </ul>
      \`;
    }

    function buildParameterSection(param) {
      return \`
        <li class="parameter">
          <strong>\${param.name}</strong> (\${param.type}) \${param.required ? '<em>(required)</em>' : ''} - \${param.description || ''}
        </li>
      \`;
    }

    function buildResponses(responses) {
      return \`
        <h4>Responses:</h4>
        <div>
          \${responses.map(response => buildResponseSection(response)).join('')}
        </div>
      \`;
    }

    function buildResponseSection(response) {
      return \`
        <div class="response">
          <strong>\${response.status}</strong> - \${response.description}
        </div>
      \`;
    }
  }
`


  private stringify(obj: SchemaApi[]) {
    return 'const options = ' + JSON.stringify(obj) + ';'
  }

  private swaggerInitFn(req: Request, res: any, next: NextFunction) {
    const url = req.url && req.url.split('?')[0]
    console.log(url)

    if (url.endsWith('/absolute-path.js')) {
      res.sendStatus(404)
    } else if (url.endsWith('/outport-des-init.js')) {
      res.set('Content-Type', 'application/javascript')
      res.send(this.outportTPLString.replace('<% apiOptions %>', this.stringify(this.apis)))
    } else {
      next()
    }
  }

  public serve(): [(req: Request, resp: any, next: NextFunction,) => void, express.Handler] {
    return [this.swaggerInitFn, express.static(getAbsoluteFSPath())];
  }
}


export default Outport