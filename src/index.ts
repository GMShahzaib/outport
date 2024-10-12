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
    const obj = this.apis.find(item => item.name == name);
    if (obj) {
      obj.endpoints = [...obj.endpoints, ...endpoints];
    } else {
      this.apis.push({ name, endpoints });
    }
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

      addBaseUrlOptions(options.values.servers);
      

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
              <div class="header-section">
                <div id="\${endpointId}_header_warper" class="header-warper">
                  <div id="\${endpointId}_parameters_tab" class="tab active" onclick="showTab('\${endpointId}','parameters')">
                    <span>Parameters</span>
                  </div>
                  <div id="\${endpointId}_body_tab" class="tab \${endpoint.method == 'get' ? 'displayNon' : ''}" onclick="showTab('\${endpointId}','body')">
                    <span>Body</span>
                  </div>
                </div>
                <button class="test-btn" onclick="toggleContent('\${endpointId}_executeBtn')">Try it</button>
              </div>
              <div id="\${endpointId}_header_content" class="header-content">
                <div id="\${endpointId}_body_content" class="tab-content">
                  <textarea class="body-input" id="\${endpointId}_input_body" onKeyUp="setupFormateJsonInterval('\${endpointId}_input_body')" rows="10" cols="50" placeholder='{"key": "value"}' name='awesome'>\${endpoint.body ? JSON.stringify(endpoint.body, undefined, 2) : ""}</textarea>
                </div>

                <div id="\${endpointId}_parameters_content" class="tab-content active">
                  \${buildParameters(endpointId, endpoint.parameters)}
                </div>
              </div>
              <div id="\${endpointId}_executeBtn" class="execute-btn-wrapper">
                <button class="execute-button" onclick="testApi('\${endpointId}', '\${endpoint.path}', '\${endpoint.method}')">Execute</button>
              </div>

              <div id="\${endpointId}_statusCode_wrapper" class="statusCode displayNon">
                <h3>Status Code</h3>
                <div id="\${endpointId}_statusCode"></div>
              </div>

              <div id="\${endpointId}_curl_wrapper" class="curl displayNon">
                <h3>cURL Command</h3>
                <pre id="\${endpointId}_curl"></pre>
              </div>

              <div id="\${endpointId}_respBody_wrapper" class="respBody displayNon">
                <h3>Response Body</h3>
                <pre id="\${endpointId}_respBody"></pre>
              </div>

              <div id="\${endpointId}_respHeaders_wrapper" class="respHeaders displayNon">
                <h3>Response Headers</h3>
                <pre id="\${endpointId}_respHeaders"></pre>
              </div>

              \${endpoint.description ? buildDescription(endpoint.description) : ""}
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

      function buildParameters(endpointId, parameters) {
        return \`
            <table class="query-params">
              <thead>
                <tr>
                  <th class="header-cell">Key</th>
                  <th class="header-cell">Value</th>
                  <th class="header-cell">Description</th>
                </tr>
              </thead>
              <tbody id="\${endpointId}_param_body">
              \${parameters.map(param => buildParameterSection(param)).join('')}
              </tbody>
            </table>
        \`;
      }

      function buildParameterSection(param) {
        return \`
          <tr class="data-row">
            <td class="data-cell"><input class="param-cell-input" disabled placeholder="key" name="key" value="\${param.key}"></input></td>
            <td class="data-cell"><input class="param-cell-input" placeholder="value" name="value" value="\${param.value}"></input></td>
            <td class="data-cell"><input class="param-cell-input" disabled placeholder="description" value="\${param.description}"></input></td>
          </tr>
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
  `;

  private stringify(obj: { apis: SchemaApi[]; values: APIDocumentation }) {
    return 'const options = ' + JSON.stringify(obj) + ';';
  }

  private swaggerInitFn(req: Request, res: any, next: NextFunction) {
    const url = req.url && req.url.split('?')[0];

    if (url.endsWith('/absolute-path.js')) {
      res.sendStatus(404);
    } else if (url.endsWith('/outport-des-init.js')) {
      res.set('Content-Type', 'application/javascript');
      res.send(this.outportTPLString.replace('<% apiOptions %>', this.stringify({ apis: this.apis, values: this.values })));
    } else {
      next();
    }
  }

  public serve(): [(req: Request, resp: any, next: NextFunction) => void, express.Handler] {
    return [this.swaggerInitFn, express.static(getAbsoluteFSPath())];
  }
}

export default Outport;
