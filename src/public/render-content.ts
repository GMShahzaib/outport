// @ts-ignore
import options from './outport-des-init.js';
import { APIDocumentation, BodyData, Endpoint, Header, Parameter, Response } from '../schema.js';
import { SchemaApi } from '../index.js';

window.onload = function () {
  const apiOptions = options as { apis: SchemaApi[]; values: APIDocumentation };
  setupUI(apiOptions);
};

function setupUI(apiOptions: { apis: SchemaApi[]; values: APIDocumentation }): void {
  populateBaseUrls(apiOptions.values.servers);
  populateHeaderInformation(apiOptions.values);
  populateApiEndpoints(apiOptions.apis);
}

function populateBaseUrls(urls: string[]): void {
  const selectElement = document.getElementById('baseUrlSelector') as HTMLSelectElement;
  selectElement.innerHTML = '';
  urls.forEach((url) => {
    const option = document.createElement('option');
    option.value = url;
    option.text = url;
    selectElement.appendChild(option);
  });
}

function populateHeaderInformation(values: APIDocumentation): void {
  const title = document.getElementById('title') as HTMLElement;
  const version = document.getElementById('version') as HTMLElement;
  const description = document.getElementById('description') as HTMLElement;
  const globalHeaders = document.getElementById('globalHeaders') as HTMLElement;

  title.innerHTML = values.title;
  version.innerHTML = 'v' + values.version;
  description.innerHTML = values.description;
  globalHeaders.innerHTML = buildGlobalHeaders(values.headers);
}

function populateApiEndpoints(apis: SchemaApi[]): void {
  const outportUI = document.getElementById('outport-ui') as HTMLElement;
  outportUI.innerHTML = apis
    .map(({ name, endpoints }) => buildApiSection(name, endpoints))
    .join('');
}

function buildApiSection(name: string, endpoints: Endpoint[]): string {
  const categoryId = uidGenerator();
  return `
    <section> 
      <div class="collapsible-main">
        <div class="clickable ptb-10" onclick="toggleContent('${categoryId}')">
          <span class="collection-name">${name}</span>
        </div>
        <div id="${categoryId}" class="endpoints">
          ${endpoints.map((endpoint) => buildEndpointSection(endpoint)).join('')}
        </div>
      </div>
    </section>
  `;
}

function buildEndpointSection(endpoint: Endpoint): string {
  const endpointId = uidGenerator();

  return `
    <div class="collapsible">
      <div class="flex clickable ptb-5" onclick="toggleContent('${endpointId}')">
        <div class="http-method ${endpoint.method.toLowerCase()}">${endpoint.method}</div>
        <div class="endpoint-path">${endpoint.path}</div>
        <div class="endpoint-summary">${endpoint.summary}</div>
      </div>
      <div id="${endpointId}" class="endpoint">
        ${buildAddressParams(endpointId, endpoint.path)}
        ${buildRequestSection(endpointId, endpoint)}
        ${buildResponseSection(endpointId, endpoint)}
        ${endpoint.responses ? buildResponses(endpoint.responses) : ''}

      </div>
    </div>
  `;
}

function buildRequestSection(endpointId: string, endpoint: Endpoint): string {
  return `
    <div class="dull-card">
      <div class="request-header-section">
        ${buildRequestTabs(endpointId, endpoint)}
        <button class="test-btn" onclick="toggleContent('${endpointId}_executeBtn')">Try it</button>
      </div>
      <div id="${endpointId}_request_header_content" class="request-content">
        ${endpoint.body ? buildRequestBodyContent(endpointId, endpoint.body):""}
        ${buildRequestHeaders(endpointId, endpoint.headers)}
        ${buildRequestParameters(endpointId, endpoint.parameters)}
      </div>
      <div id="${endpointId}_executeBtn" class="execute-btn-wrapper">
        <button class="execute-button" onclick="execute('${endpointId}', '${endpoint.path}', '${endpoint.method}')">Execute</button>
      </div>
    </div>
  `;
}

function buildResponseSection(endpointId: string, endpoint: Endpoint): string {
  return `
    <div id="${endpointId}_response" class="dull-card displayNon">
      <div class="response-header-section">
        ${buildResponseTabs(endpointId)}
        <div class="response-status-code">
          status code: <span id="${endpointId}_statusCode" class="status-code"></span>
        </div>
      </div>
      <div id="${endpointId}_response_header_content" class="header-content">
        ${buildResponseBodyContent(endpointId)}
        ${buildResponseHeaders(endpointId)}
      </div>
      ${endpoint.description ? buildDescription(endpoint.description) : ''}
    </div>
  `;
}

function buildRequestTabs(endpointId: string, endpoint: Endpoint): string {
  return `
    <div id="${endpointId}_request_header_tabs" class="tabs">
      <div id="${endpointId}_request_parameters_tab" class="tab active" onclick="showTab('${endpointId}','request_header','request_parameters')">
        <span>Parameters</span>
      </div>
      <div id="${endpointId}_request_headers_tab" class="tab ${!endpoint.headers?.length ? 'displayNon' : ''}" onclick="showTab('${endpointId}','request_header','request_headers')">
        <span>Headers</span>
      </div>
      <div id="${endpointId}_request_body_tab" class="tab ${endpoint.method === 'GET' ? 'displayNon' : ''}" onclick="showTab('${endpointId}','request_header','request_body')">
        <span>Body</span>
      </div>
    </div>
  `;
}

function buildRequestBodyContent(endpointId: string, body: { type: 'json' | 'form', data: BodyData[] }): string {
  const bodyType = body?.type;
  const isJson = bodyType === 'json';

  if (isJson) {
    const requestBody = extractRequestBody(body);

    return `
      <div id="${endpointId}_request_body_content" class="tab-content">
      <div>
       <select disabled id="${endpointId}_body_type_selector" class="body-type-select" value="json">
          <option value="json">json</option>
       </select>
      </div>
      <div>
          <textarea class="body-input" id="${endpointId}_json_input_body" onKeyUp="setupFormateJsonInterval('${endpointId}_json_input_body')" rows="10" cols="50" placeholder='{"key": "value"}' name='awesome'>${JSON.stringify(requestBody, undefined, 2)}</textarea>
      </div>
      </div>
    `;
  } else {
    return `
    <div id="${endpointId}_request_body_content" class="tab-content">
      <div>
       <select disabled id="${endpointId}_body_type_selector" class="body-type-select" value="form">
          <option value="form">form</option>
       </select>
      </div>
      <div>
        <form id="${endpointId}_form_input_body" class="body-form">
          ${body?.data?.map(buildFormDataField).join('')}
        </form>
      </div>
    </div>
  `;
  }
}

function buildResponseTabs(endpointId: string): string {
  return `
    <div id="${endpointId}_response_header_tabs" class="tabs">
      <div id="${endpointId}_response_body_tab" class="tab active" onclick="showTab('${endpointId}','response_header','response_body')">
        <span>Body</span>
      </div>
      <div id="${endpointId}_response_headers_tab" class="tab" onclick="showTab('${endpointId}','response_header','response_headers')">
        <span>Headers</span>
      </div>
    </div>
  `;
}

function buildResponseBodyContent(endpointId: string): string {
  return `
    <div id="${endpointId}_response_body_content" class="tab-content active">
      <div id="${endpointId}_respBody_wrapper" class="respBody">
        <pre id="${endpointId}_respBody"></pre>
      </div>
    </div>
  `;
}

function extractRequestBody(body: { type: 'json' | 'form', data: BodyData[] }): Record<string, string> {
  return (body?.data || []).reduce((acc: Record<string, string>, { key, value }) => {
    acc[key] = value as string;
    return acc;
  }, {});
}

function buildFormDataField(data: { key: string; value?: string | number, type: string }): string {
  return `
  <div>
    <label class="body-form-title" for="${data.key}">${data.key}:</label>
    <input type="${data.type}"  name="${data.key}" value="${data.value || ""}" accept="image/*" >
  </div>
  `;
}

function buildGlobalHeaders(headers: Header[]): string {
  return `
    <div>
      ${headers
      .map(({ key, value, description }) => `
          <div class="globe-header-container">
            <span class="header-key">${key}:</span>
            <div class="header-details">
              <input id="${key}_value" header-data-key="${key}" type="text" class="input-field" value="${value}">
              <p class="header-description">${description}</p>
            </div>
          </div>
        `).join('')}
    </div>
  `;
}

function buildAddressParams(endpointId: string, url: string): string {
  const variables = extractVariablesFromUrl(url);
  return `
    <div id="${endpointId}_address_params">
      ${variables
      .map((name) => `
          <div class="flex-row-start">
            <div class="url-param-cell-input">${name}: </div>
            <div class="url-param-cell-input"><input id="${endpointId}_${name}_value" class="url-param-input" placeholder="value" name="value"></input></div>
          </div>
        `).join('')}
    </div>
  `;
}

function buildRequestHeaders(endpointId: string, headers: Header[] = []): string {
  return `
  <div id="${endpointId}_request_headers_content" class="tab-content">
    <table class="table">
      <thead>
        <tr>
          <th class="header-cell">Key</th>
          <th class="header-cell">Value</th>
          <th class="header-cell">Description</th>
        </tr>
      </thead>
      <tbody id="${endpointId}_request_headers_content">
        ${headers.map(buildRequestHeader).join('')}
      </tbody>
    </table>
  </div>
  `;
}

function buildRequestHeader(header: Header): string {
  return `
    <tr class="data-row">
      <td class="data-cell"><input class="param-cell-input" disabled placeholder="key" name="key" value="${header.key}"></input></td>
      <td class="data-cell"><input class="param-cell-input border-background-non" placeholder="value" name="value" value="${header.value}"></input></td>
      <td class="data-cell"><input class="param-cell-input" disabled placeholder="description" value="${header.description}"></input></td>
    </tr>
  `;
}

function buildRequestParameters(endpointId: string, parameters?: Parameter[]): string {
  return `
    <div id="${endpointId}_request_parameters_content" class="tab-content active">
      <table class="table">
        <thead>
          <tr>
            <th class="header-cell">Key</th>
            <th class="header-cell">Value</th>
            <th class="header-cell">Description</th>
          </tr>
        </thead>
        <tbody id="${endpointId}_query_params_body">
          ${parameters && parameters.map(buildParameterSection).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function buildParameterSection(param: Parameter): string {
  return `
    <tr class="data-row">
      <td class="data-cell"><input class="param-cell-input" disabled placeholder="key" name="key" value="${param.key}"></input></td>
      <td class="data-cell"><input class="param-cell-input border-background-non" placeholder="value" name="value" value="${param.value}"></input></td>
      <td class="data-cell"><input class="param-cell-input" disabled placeholder="description" value="${param.description}"></input></td>
    </tr>
  `;
}

function buildResponseHeaders(endpointId: string): string {
  return `
    <div id="${endpointId}_response_headers_content" class="tab-content response-headers">
        <table class="table whiteBorder">
          <thead>
            <tr>
              <th class="header-cell whiteBorder">Key</th>
              <th class="header-cell whiteBorder">Value</th>
            </tr>
          </thead>
          <tbody id="${endpointId}_response_headers"></tbody>
        </table>
    </div>
  `;
}

function buildResponses(responses: Response[]): string {
  return `
    <h4>Responses:</h4>
    <div>
      ${responses.map((response) => `
        <div class="dull-card">
          <strong>${response.status}</strong> - ${response.description}
        </div>
      `).join('')}
    </div>
  `;
}

function buildDescription(description: string): string {
  return `<p><strong>Description:</strong> ${description}</p>`;
}

function uidGenerator(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
