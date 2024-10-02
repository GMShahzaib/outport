import express, { NextFunction, Request } from 'express'

import { APIDocumentation, Endpoint } from './schema.js';
import { getAbsoluteFSPath } from './public/absolute-path.js';

export interface SchemaApi { name: string, endpoints: Endpoint[] }

class Outport {
  private values: APIDocumentation;
  private apis: SchemaApi[];


  constructor(values: APIDocumentation) {
    this.values = values;
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


    function addBaseUrlOptions(urls) {
        const selectElement = document.getElementById('baseUrlSelector');

        // Clear existing options if necessary
        selectElement.innerHTML = '';

        // Loop through the array of URLs and create an <option> element for each
        urls.forEach(url => {
            const option = document.createElement('option');
            option.value = url;  // Set the value for the option
            option.text = url;   // Set the visible text
            selectElement.appendChild(option);  // Append the option to the select element
        });
    }

    addBaseUrlOptions(options.values.servers)

    const title = document.getElementById("title");
    const version = document.getElementById("version");
    const description = document.getElementById("description");
    title.innerHTML = options.values.title;
    version.innerHTML = 'v'+options.values.version;
    description.innerHTML = options.values.description;


    const outportUI = document.getElementById("outport-ui");

    outportUI.innerHTML = options.apis.map(({ name, endpoints }) => buildApiSection(name, endpoints)).join('');

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
        <div class="collapsible">
          <div class="flex clickable ptb-5" onclick="toggleContent('\${endpointId}')">
            <div class="http-method \${endpoint.method.toLowerCase()}">\${endpoint.method}</div>
            <div class="endpoint-path">\${endpoint.path}</div>
            <div class="endpoint-summary">\${endpoint.summary}</div>
          </div>
          <div id="\${endpointId}" class="endpoint">
          <div class="parameters-section">
              <div class="parameters-title">
                  <span>Parameters</span>
                  <div class="underline"></div>
              </div>
              <button class="test-btn" onclick="toggleContent('\${endpointId}_executeBtn')">Try it</button>
          </div>
          <div id="\${endpointId}_executeBtn" class="execute-btn-wrapper">
            <button class="execute-button" onclick="testApi({endpoint:'\${endpoint.path}'},'\${endpointId}')">Execute</button>
          </div>
          <div id="\${endpointId}_statusCode"></div>
          <pre id="\${endpointId}_curl"></pre>
          <pre id="\${endpointId}_respBody"></pre>
          <pre id="\${endpointId}_respHeaders"></pre>

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


  private stringify(obj: { apis: SchemaApi[], values: APIDocumentation }) {
    return 'const options = ' + JSON.stringify(obj) + ';'
  }

  private swaggerInitFn(req: Request, res: any, next: NextFunction) {
    const url = req.url && req.url.split('?')[0]

    if (url.endsWith('/absolute-path.js')) {
      res.sendStatus(404)
    } else if (url.endsWith('/outport-des-init.js')) {
      res.set('Content-Type', 'application/javascript')
      res.send(this.outportTPLString.replace('<% apiOptions %>', this.stringify({ apis: this.apis, values: this.values })))
    } else {
      next()
    }
  }

  public serve(): [(req: Request, resp: any, next: NextFunction,) => void, express.Handler] {
    return [this.swaggerInitFn, express.static(getAbsoluteFSPath())];
  }
}


export default Outport