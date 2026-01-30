// @ts-ignore
import options from './outport-des-init.js';
import { APIDocumentation, BodyData, Endpoint, Header, Parameter, ExampleResponse } from '../index.js';

window.onload = function () {
  const apiOptions = options as { apis: { name: string, endpoints: Endpoint[] }[]; values: APIDocumentation };
  setupUI(apiOptions);
};

function setupUI({ apis, values }: { apis: { name: string, endpoints: Endpoint[] }[]; values: APIDocumentation }): void {
  const baseUrlContain = document.getElementById('base-url-container') as HTMLDivElement
  const playgroundContainer = document.getElementById('playground-container') as HTMLDivElement

  if (values.playground) {
    playgroundContainer.classList.remove("displayNon")
  } else {
    playgroundContainer.classList.add("displayNon")
  }

  if (values.servers) {
    populateBaseUrls(values.servers);
    baseUrlContain.style.display = "block"
  } else {
    baseUrlContain.style.display = "none"
  }
  populateHeaderInformation(values);
  populateApiEndpoints(apis, values.timeout);
  initEventDelegation();
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
  selectElement.style.display = "block"
}

function populateHeaderInformation(values: APIDocumentation): void {
  const title = document.getElementById('title') as HTMLElement;
  const version = document.getElementById('version') as HTMLElement;
  const description = document.getElementById('description') as HTMLElement;
  const globalHeaders = document.getElementById('globalHeaders') as HTMLElement;

  title.innerHTML = escapeHtml(values.title);
  version.innerHTML = 'v' + escapeHtml(values.version);
  description.innerHTML = escapeHtml(values.description);

  const globalHeadersBtn = document.getElementById('globalHeadersBtn') as HTMLButtonElement

  if (values.headers) {
    globalHeaders.innerHTML = buildGlobalHeaders(values.headers);
    globalHeadersBtn.classList.remove("displayNon")
  } else {
    globalHeadersBtn.classList.add("displayNon")
  }
}

function populateApiEndpoints(apis: { name: string, endpoints: Endpoint[] }[], timeout?: number): void {
  const outportUI = document.getElementById('outport-ui') as HTMLElement;
  outportUI.innerHTML = apis
    .map(({ name, endpoints }) => buildApiSection(name, endpoints, timeout))
    .join('');
  if (apis.length == 0) {
    outportUI.innerHTML = `<div class="empty-data-message">No Data!</div>`
  }

}

function buildApiSection(name: string, endpoints: Endpoint[], timeout?: number): string {
  const categoryId = uidGenerator();
  return `
    <section>
      <div class="collapsible-main">
        <div class="clickable ptb-10" data-action="toggleContent" data-id="${categoryId}">
          <span class="collection-name">${escapeHtml(name)}</span>
        </div>
        <div id="${categoryId}" class="endpoints">
          ${endpoints.map((endpoint) => buildEndpointSection(endpoint, timeout)).join('')}
        </div>
      </div>
    </section>
  `;
}

function buildEndpointSection(endpoint: Endpoint, timeout?: number): string {
  const endpointId = uidGenerator();

  return `
    <div class="collapsible" data-hover-show="${endpointId}_redirectBtn">
      <div class="flex-box clickable ptb-5" >
        <div class="flex-box endpoint-header" data-action="toggleContent" data-id="${endpointId}">
            <div class="http-method ${endpoint.method.toLowerCase()}">${endpoint.method}</div>
            <div class="endpoint-path">${escapeHtml(endpoint.path)}</div>
            <div class="endpoint-summary">${escapeHtml(endpoint.summary)}</div>
        </div>
        <div id="${endpointId}_redirectBtn" class="displayNon" ><button class="icon-btn" title="load to Playground" data-action="loadDataToPlayground" data-id="${endpointId}" data-path="${escapeHtml(endpoint.path)}" data-method="${endpoint.method}"><img class="image-icon" src="./assets/redirect_icon.png" alt="Italian Trulli"></button></div>
      </div>
      <div id="${endpointId}" class="endpoint">
        ${buildAddressParams(endpointId, endpoint.path)}
        ${buildRequestSection(endpointId, endpoint, timeout)}
        ${buildResponseSection(endpointId, endpoint)}
        ${endpoint.responses ? buildResponses(endpointId, endpoint.responses) : ''}

      </div>
    </div>
  `;
}

function buildRequestSection(endpointId: string, endpoint: Endpoint, timeout?: number): string {
  return `
    <div class="dull-card">
      <div class="request-header-section">
        ${buildRequestTabs(endpointId, endpoint)}
        <div id="${endpointId}_executeBtn_wrapper">
          <button id="${endpointId}_executeBtn" class="execute-button" data-action="execute" data-id="${endpointId}" data-path="${escapeHtml(endpoint.path)}" data-method="${endpoint.method}" data-timeout="${timeout !== undefined ? timeout : ''}">execute</button>
          <div id="${endpointId}_executeBtn_loader" class="loader" style="display:none;"></div>
        </div>
      </div>
      <div id="${endpointId}_request_header_content" class="request-content">
        ${endpoint.body ? buildRequestBodyContent(endpointId, endpoint.body) : ""}
        ${buildRequestHeaders(endpointId, endpoint.headers)}
        ${buildRequestParameters(endpointId, endpoint.parameters)}
      </div>
    </div>
  `;
}


function buildResponseSection(endpointId: string, endpoint: Endpoint): string {
  return `
    <div id="${endpointId}_response" class="dull-card displayNon">
      <div class="response-header-section">
        ${buildResponseTabs(endpointId)}
        <div class="flex-box">
          <div class="response-time">
            <span id="${endpointId}_resp_time"></span>
          </div>

          <div class="response-status-code">
            status code: <span id="${endpointId}_statusCode" class="status-code"></span>
          </div>
        </div>
      </div>
      <div id="${endpointId}_response_header_content">
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
      <div id="${endpointId}_request_parameters_tab" class="tab active" data-action="showTab" data-endpoint="${endpointId}" data-wrapper="request_header" data-tab="request_parameters">
        <span>Parameters</span>
      </div>
      <div id="${endpointId}_request_headers_tab" class="tab ${!endpoint.headers?.length ? 'displayNon' : ''}" data-action="showTab" data-endpoint="${endpointId}" data-wrapper="request_header" data-tab="request_headers">
        <span>Headers</span>
      </div>
      <div id="${endpointId}_request_body_tab" class="tab ${endpoint.method === 'GET' ? 'displayNon' : ''}" data-action="showTab" data-endpoint="${endpointId}" data-wrapper="request_header" data-tab="request_body">
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
          <textarea class="body-input" id="${endpointId}_json_input_body" data-action="formatJson" data-id="${endpointId}_json_input_body" rows="10" cols="50" placeholder='{"key": "value"}' name='awesome'>${JSON.stringify(requestBody, undefined, 2)}</textarea>
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
          <table class="table" id="playground_form_body_table">
              <thead>
                  <tr>
                      <th class="header-cell">Key</th>
                      <th class="header-cell">Value</th>
                  </tr>
              </thead>
              <tbody>
                  ${body?.data?.map(buildFormDataField).join('')}
              </tbody>
          </table>
        </form>
      </div>
    </div>
  `;
  }
}

function buildResponseTabs(endpointId: string): string {
  return `
    <div id="${endpointId}_response_header_tabs" class="tabs">
      <div id="${endpointId}_response_body_tab" class="tab active" data-action="showTab" data-endpoint="${endpointId}" data-wrapper="response_header" data-tab="response_body">
        <span>Body</span>
      </div>
      <div id="${endpointId}_response_headers_tab" class="tab" data-action="showTab" data-endpoint="${endpointId}" data-wrapper="response_header" data-tab="response_headers">
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

function extractRequestBody(body: { type: 'json' | 'form', data: BodyData[] }): Record<string, any> {
  return (body?.data || []).reduce((acc: Record<string, any>, { key, value }) => {
    acc[key] = value !== undefined ? value : '';
    return acc;
  }, {});
}

function buildFormDataField(data: BodyData): string {
  return `
  <tr class="data-row">
    <td class="data-cell">
        <div class="flex-box">
            <input class="param-cell-input border-background-non" value="${escapeHtml(data.key)}" disabled>
            <select class="border-background-non" disabled>
              ${data.type == "text" ? '<option value="text">TEXT</option>' : '<option value="file">FILE</option>'}
            </select>
        </div>
    </td>
    <td class="data-cell">
        <input type="${data.type}"
            class="param-cell-input border-background-non value-input" name="${escapeHtml(data.key)}" value="${escapeHtml(String(data.value || ""))}"
            placeholder="value" accept="image/*">
    </td>
  </tr>
  `;
}

function buildGlobalHeaders(headers: Header[]): string {
  return `
    <div>
      ${headers
      .map(({ key, value, description }) => `
          <div class="globe-header-container">
            <span class="header-key">${escapeHtml(key)}:</span>
            <div class="header-details">
              <input id="${escapeHtml(key)}_value" header-data-key="${escapeHtml(key)}" type="text" class="input-field" value="${escapeHtml(value)}">
              <p id="${escapeHtml(key)}_description" class="header-description">${escapeHtml(description || "")}</p>
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
            <div class="url-param-cell-input">${escapeHtml(name)}: </div>
            <div class="url-param-cell-input"><input id="${endpointId}_${escapeHtml(name)}_value" class="url-param-input" placeholder="value" name="value"></input></div>
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
      <tbody id="${endpointId}_request_headers_body">
        ${headers.map(buildRequestHeader).join('')}
      </tbody>
    </table>
  </div>
  `;
}

function buildRequestHeader(header: Header): string {
  return `
    <tr class="data-row">
      <td class="data-cell"><input class="param-cell-input" disabled placeholder="key" name="key" value="${escapeHtml(header.key)}"></input></td>
      <td class="data-cell"><input class="param-cell-input border-background-non" placeholder="value" name="value" value="${escapeHtml(header.value)}"></input></td>
      <td class="data-cell"><input class="param-cell-input" disabled placeholder="description" name="description" value="${escapeHtml(header.description || "")}"></input></td>
    </tr>
  `;
}

function buildRequestParameters(endpointId: string, parameters?: Parameter[]): string {
  return `
    <div id="${endpointId}_request_parameters_content" class="tab-content active">
      <table id="${endpointId}_parameters_table" class="table">
        <thead>
          <tr>
            <th class="header-cell">Key</th>
            <th class="header-cell">Value</th>
            <th class="header-cell">Description</th>
          </tr>
        </thead>
        <tbody id="${endpointId}_query_params_body">
          ${parameters ? parameters.map(buildParameterSection).join('') : ""}
        </tbody>
      </table>
      <h6 class="add-more-text-btn" data-action="addRow" data-table="${endpointId}_parameters_table">Add more...</h6>
    </div>
  `;
}

function buildParameterSection(param: Parameter): string {
  return `
    <tr class="data-row">
      <td class="data-cell"><input class="param-cell-input" disabled placeholder="key" name="key" value="${escapeHtml(param.key)}"></input></td>
      <td class="data-cell"><input class="param-cell-input border-background-non" placeholder="value" name="value" value="${escapeHtml(param.value)}"></input></td>
      <td class="data-cell"><input class="param-cell-input border-background-non" disabled placeholder="description" name="description" value="${escapeHtml(param.description || "")}"></td>
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

function buildResponses(endpointId: string, responses: ExampleResponse[]): string {
  return `
    <div class="dull-card">
      <div class="pointer">
        <h4>Responses:</h4>
      </div>
      <div id='${endpointId}_responses'>
        ${responses.map((response, ind) => `
          <div class="example-response">
            <div class="flex-box pointer" data-action="toggleContent" data-id="${endpointId}_${ind}">
              <div class="example-response-description">
                <span>${escapeHtml(response.description)}</span>
              </div>
              <div class="example-response-status-code">
                Status code: <span class="status-code">${response.status}</span>
              </div>
            </div>
            <div id="${endpointId}_${ind}" class="dull-card" style="display:none;">
              <div class="response-header-section">
                <div id="${endpointId}_${ind}_response_header_tabs" class="tabs">
                  ${response.value ? `
                    <div id="${endpointId}_${ind}_response_body_tab" class="tab active"
                      data-action="showTab" data-endpoint="${endpointId}_${ind}" data-wrapper="response_header" data-tab="response_body">
                      <span>Body</span>
                    </div>` : ''}
                  ${response.headers ? `
                    <div id="${endpointId}_${ind}_response_headers_tab" class="tab"
                      data-action="showTab" data-endpoint="${endpointId}_${ind}" data-wrapper="response_header" data-tab="response_headers">
                      <span>Headers</span>
                    </div>` : ''}
                </div>
              </div>
              <div id="${endpointId}_${ind}_response_header_content">
                ${response.value ? `
                  <div id="${endpointId}_${ind}_response_body_content" class="tab-content active">
                    <div id="${endpointId}_${ind}_respBody_wrapper" class="respBody">
                      <pre id="${endpointId}_${ind}_respBody">${escapeHtml(((data): string => {
        let body: string | Object = data;

        // Check if the data is a JSON-like string and parse it to an object if necessary
        try {
          body = typeof body === 'string' && isValidJson(body) ? JSON.parse(body) : body;
        } catch (_) {
          // Handle parsing error (if any)
          console.error('Invalid JSON format');
        }

        // Check if the body is an object and stringify it, otherwise return it as is
        if (typeof body === 'object' && body !== null) {
          try {
            body = JSON.stringify(body, null, 4); // Convert to formatted JSON string
          } catch (_) {
            console.error('Stringify failed');
          }
        }
        return String(body);
      })(response.value))}</pre>
                    </div>
                  </div>` : ''}
                ${response.headers ? `
                  <div id="${endpointId}_${ind}_response_headers_content" class="tab-content response-headers">
                    <table class="table whiteBorder">
                      <thead>
                        <tr>
                          <th class="header-cell whiteBorder">Key</th>
                          <th class="header-cell whiteBorder">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${response.headers.map((header) => `
                          <tr class="data-row">
                            <td class="data-cell whiteBorder">
                              <span class="response-header-key">${escapeHtml(header.key)}</span>
                            </td>
                            <td class="data-cell whiteBorder">
                              <span class="response-header-value">${escapeHtml(header.value)}</span>
                            </td>
                          </tr>`).join('')}
                      </tbody>
                    </table>
                  </div>` : ''}
              </div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  `;
}

function buildDescription(description: string): string {
  return `<p><strong>Description:</strong> ${escapeHtml(description)}</p>`;
}

function uidGenerator(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Event delegation for CSP compliance
function initEventDelegation(): void {
  document.addEventListener('click', handleClick);
  document.addEventListener('keyup', handleKeyUp);
  document.addEventListener('mouseenter', handleMouseEnter, true);
  document.addEventListener('mouseleave', handleMouseLeave, true);
}

function handleClick(e: Event): void {
  const target = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
  if (!target) {
    // Handle stop propagation for modal content (only if no action)
    const stopPropTarget = (e.target as HTMLElement).closest('[data-stop-propagation]');
    if (stopPropTarget) {
      e.stopPropagation();
    }
    return;
  }

  const action = target.dataset.action;
  switch (action) {
    case 'toggleContent':
      toggleContent(target.dataset.id!);
      break;
    case 'showTab':
      showTab(target.dataset.endpoint!, target.dataset.wrapper!, target.dataset.tab!);
      break;
    case 'execute':
      execute(
        target.dataset.id!,
        target.dataset.path!,
        target.dataset.method!,
        target.dataset.timeout ? Number(target.dataset.timeout) : undefined
      );
      break;
    case 'loadDataToPlayground':
      loadDataToPlayground(target.dataset.id!, target.dataset.path!, target.dataset.method!);
      break;
    case 'addRow':
      addRow(target.dataset.table!);
      break;
    case 'deleteRow':
      deleteRow(target);
      break;
    case 'goToPlayground':
      goToPlaygroundWithoutData();
      break;
    case 'showModal':
      showModal();
      break;
    case 'hideModal':
      hideModal();
      break;
    case 'hideToast':
      hideToast();
      break;
  }
}

function handleKeyUp(e: Event): void {
  const target = e.target as HTMLElement;
  if (target.dataset.action === 'formatJson') {
    setupFormateJsonInterval(target.dataset.id!);
  }
}

function handleMouseEnter(e: Event): void {
  const target = e.target as HTMLElement;
  if (!target || !target.dataset) return;
  const showId = target.dataset.hoverShow;
  if (showId) showElement(showId);
}

function handleMouseLeave(e: Event): void {
  const target = e.target as HTMLElement;
  if (!target || !target.dataset) return;
  const showId = target.dataset.hoverShow;
  if (showId) hideElement(showId);
}
