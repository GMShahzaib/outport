// Request cancellation controller
let currentRequestController: AbortController | null = null;

// Element references (with null checks for safety)
const bodyTypeSelectElement = document.getElementById('playground_request_body_type') as HTMLSelectElement | null;
const jsonDiv = document.getElementById('request_body_json') as HTMLDivElement | null;
const formDiv = document.getElementById('request_body_form') as HTMLDivElement | null;
const jsonBodyInput = document.getElementById(`playground_json_input_body`) as HTMLTextAreaElement | null;
const formBodyData = document.getElementById(`playground_form_body`) as HTMLFormElement | null;
const parametersTable = document.getElementById("parametersTable") as HTMLTableElement | null;
const headersTable = document.getElementById("headersTable") as HTMLTableElement | null;
const responseHeadersTable = document.getElementById("responseHeadersTable") as HTMLTableElement | null;
const urlInput = document.getElementById("playground-url-input") as HTMLInputElement | null;
const methodSelect = document.getElementById("playground-method-selector") as HTMLSelectElement | null;


// Initial setup
if (jsonDiv) jsonDiv.style.display = 'block';

// Change request body type
if (bodyTypeSelectElement) {
    bodyTypeSelectElement.addEventListener('change', toggleRequestBodyType);
}


window.onload = function (): void {
    let data: Record<string, any> = {};
    try {
        const stored = sessionStorage.getItem('playgroundData');
        if (stored) {
            data = JSON.parse(stored);
        }
    } catch (error) {
        console.warn('Corrupted playground data, starting fresh:', error);
        sessionStorage.removeItem('playgroundData');
    }

    if (data.url) loadUrl(data.url);
    if (data.method) loadMethod(data.method);
    if (data.headers) loadHeaders(data.headers);
    if (data.params) {
        loadParams(data.params)
        updateURL();
    };
    if (data.bodyType) {
        loadBodyType(data.bodyType);
        if (data.bodyType === "json" && data.body) {
            loadJsonBody(data.body);
        } else if (data.bodyType === "form" && data.body) {
            loadFormBody(data.body);
        }
    }
};

function loadUrl(url: string): void {
    if (!urlInput) return;
    try {
        urlInput.value = decodeURIComponent(url);
    } catch {
        urlInput.value = url; // Fallback to raw URL if decoding fails
    }
}

function loadMethod(method: string): void {
    if (methodSelect) methodSelect.value = method.toLowerCase();
}


function loadParams(params: { [key: string]: { value: string, description: string } }): void {
    const parametersTableBody = document.querySelector<HTMLTableSectionElement>('#parametersTable tbody');

    if (parametersTableBody && Object.keys(params).length !== 0) {
        parametersTableBody.innerHTML = "";
    }

    Object.keys(params).forEach(key => {
        addRow("parametersTable", key, params[key].value, params[key].description);
    });
}

function loadHeaders(headers: { [key: string]: { value: string, description: string } }): void {
    const headersTableBody = document.querySelector<HTMLTableSectionElement>('#headersTable tbody');

    if (headersTableBody && Object.keys(headers).length !== 0) {
        headersTableBody.innerHTML = "";
    }

    Object.keys(headers).forEach(key => {
        addRow("headersTable", key, headers[key].value, headers[key].description);
    });
}

function loadBodyType(bodyType: string): void {
    if (bodyTypeSelectElement) bodyTypeSelectElement.value = bodyType;
    toggleRequestBodyType();
}

function loadJsonBody(body: string): void {
    if (!jsonBodyInput) return;
    jsonBodyInput.value = body;
    formatJson(jsonBodyInput);
}
function loadFormBody(body: string): void {
    try {
        const formData = JSON.parse(body);
        const formDataTableBody = document.querySelector<HTMLTableSectionElement>(`#playground_form_body_table tbody`);

        if (formDataTableBody) {
            formDataTableBody.innerHTML = "";
        }

        Object.keys(formData).forEach(key => {
            addReqBodyRow(key, formData[key]?.type, formData[key]?.value)
        });
    } catch {
        console.warn('Invalid form body data in storage');
    }
}

function updateFormValueKey(keyInput: HTMLInputElement): void {
    // Find the associated value input field in the same row
    const valueInput = keyInput.closest('.data-row')?.querySelector('.value-input') as HTMLInputElement | null;

    // Update the name attribute of the value input to match the key input value if it exists
    if (valueInput) {
        valueInput.name = keyInput.value;
    }
}

function toggleRequestBodyType(): void {
    if (!bodyTypeSelectElement || !jsonDiv || !formDiv) return;
    const isJson = bodyTypeSelectElement.value === 'json';
    jsonDiv.style.display = isJson ? 'block' : 'none';
    formDiv.style.display = isJson ? 'none' : 'block';
}

function addRowWithQueryParamListeners(): void {
    addParamRow("parametersTable");
}

function addParamRow(tableId: string, key?: string, value?: string, description?: string): void {
    const table = document.getElementById(tableId);
    const tableBody = table?.querySelector('tbody');
    if (tableBody) {
        const newRow = document.createElement('tr');
        newRow.classList.add('data-row');
        newRow.innerHTML = `
            <td class="data-cell"><input class="param-cell-input border-background-non" value="${escapeHtml(key || "")}" placeholder="key" name="key"></td>
            <td class="data-cell">
                <input class="param-cell-input border-background-non" placeholder="value" name="value" value="${escapeHtml(value || "")}">
            </td>
            <td class="data-cell">
                <div class="flex-box">
                    <input class="param-cell-input border-background-non" placeholder="description" name="description" value="${escapeHtml(description || "")}">
                    <h6 class="delete-text-btn" data-action="deleteParamRow">delete</h6>
                </div>
            </td>
            `;
        tableBody.appendChild(newRow);
    }
}

function addReqBodyRow(key?: string, valueType?: string, value?: string): void {
    const tableBody = document.querySelector<HTMLTableSectionElement>(`#playground_form_body_table tbody`);
    if (!tableBody) return;
    const newRow = document.createElement('tr');
    newRow.classList.add('data-row');

    newRow.innerHTML = `
        <td class="data-cell">
            <div class="flex-box">
                <input class="param-cell-input border-background-non key-input" value="${escapeHtml(key || "")}" placeholder="key" data-action="updateFormValueKey">
                <select class="border-background-non" data-action="changeBodyFormInputType">
                    <option value="text" ${valueType !== "file" ? "selected" : ""}>TEXT</option>
                    <option value="file" ${valueType === "file" ? "selected" : ""}>FILE</option>
                </select>
            </div>
        </td>
        <td class="data-cell">
            <div class="flex-box">
                <input type="${escapeHtml(valueType || "text")}" name="${escapeHtml(key || "")}" value="${escapeHtml(value || "")}" class="param-cell-input border-background-non value-input" placeholder="value" accept="image/*">
                <h6 class="delete-text-btn" data-action="deleteRow">delete</h6>
            </div>
        </td>
    `;

    tableBody.appendChild(newRow);
}

function deleteParamRow(element: HTMLElement): void {
    element.closest('tr')?.remove();
    updateURL()
}


async function sendRequest(event: Event): Promise<void> {
    event.preventDefault();
    const responseUnavailable = document.getElementById(`playground-response-unavailable`);
    const responseSection = document.getElementById(`playground-response-section`);
    const loader = document.getElementById(`playground-executeBtn-loader`);

    if (!urlInput || !methodSelect) return;
    const url = urlInput.value;
    const method = methodSelect.value;
    const headersList = getHeaders();
    const headers: Record<string, string> = {}

    Object.keys(headersList).forEach(key => {
        headers[key] = headersList[key].value;
    });

    const body = method !== "get" ? getBody() : undefined;

    if (!url || !method) {
        return showToast("Request is empty.");
    }

    // Cancel any in-flight request
    if (currentRequestController) {
        currentRequestController.abort();
    }
    currentRequestController = new AbortController();

    responseUnavailable?.classList.add("displayNon");
    responseSection?.classList.add("displayNon");
    loader?.classList.remove("displayNon");

    try {
        const { success, errorMessage, data, headers: respHeaders, status, time } = await testApi({
            path: url,
            method,
            headers,
            body,
            timeout: 60000,
            signal: currentRequestController.signal
        });

        if (!success) {
            showToast(errorMessage || "Something went wrong!");
        } else {
            updateUIWithResponse("playground", time, status as number, respHeaders as { [key: string]: string }, data as string);
            responseSection?.classList.remove("displayNon");
        }
    } catch (error) {
        // Ignore abort errors from intentional cancellation
        if (error instanceof Error && error.name !== 'AbortError') {
            showToast("An unexpected error occurred!");
        }
    } finally {
        loader?.classList.add("displayNon");
        currentRequestController = null;
    }
}

function getBody(): string | FormData | undefined {
    if (!bodyTypeSelectElement || !jsonBodyInput || !formBodyData) return;
    let requestBody
    const value = bodyTypeSelectElement.value

    const isJson = value === "json"
    if (isJson) {
        const body = jsonBodyInput.value;
        if (body && !isValidJson(body)) {
            showErrorOnBody("playground");
            return;
        }
        requestBody = body && JSON.stringify(JSON.parse(body));
        removeErrorOnBody("playground");
    } else {
        requestBody = new FormData(formBodyData)
    }
    return requestBody
}

function getHeaders(): { [key: string]: { value: string, description: string } } {
    const headers: { [key: string]: { value: string, description: string } } = {};
    if (!headersTable) return headers;
    const rows = headersTable.querySelectorAll("tr.data-row");

    rows.forEach(row => {
        const keyEl = row.querySelector('input[name="key"]') as HTMLInputElement | null;
        const valueEl = row.querySelector('input[name="value"]') as HTMLInputElement | null;
        const descEl = row.querySelector('input[name="description"]') as HTMLInputElement | null;
        if (!keyEl || !valueEl) return;
        const key = keyEl.value;
        const value = valueEl.value;
        const description = descEl?.value || '';
        if (key && value) {
            headers[key] = { value, description };
        }
    });
    return headers
}

function getParams(): { [key: string]: { value: string, description: string } } {
    const params: { [key: string]: { value: string, description: string } } = {};
    if (!parametersTable) return params;
    const rows = parametersTable.querySelectorAll("tr.data-row");

    rows.forEach(row => {
        const keyEl = row.querySelector('input[name="key"]') as HTMLInputElement | null;
        const valueEl = row.querySelector('input[name="value"]') as HTMLInputElement | null;
        const descEl = row.querySelector('input[name="description"]') as HTMLInputElement | null;
        if (!keyEl || !valueEl) return;
        const key = keyEl.value;
        const value = valueEl.value;
        const description = descEl?.value || '';
        if (key && value) {
            params[key] = { value, description };
        }
    });
    return params
}


function updateURL(): void {
    if (!urlInput || !parametersTable) return;
    let baseUrl = urlInput.getAttribute("data-base-url") || urlInput.value.split("?")[0];
    urlInput.setAttribute("data-base-url", baseUrl);  // Store the original base URL

    const queryParams: string[] = [];
    const rows = parametersTable.querySelectorAll("tr.data-row");

    rows.forEach(row => {
        const keyEl = row.querySelector('input[name="key"]') as HTMLInputElement | null;
        const valueEl = row.querySelector('input[name="value"]') as HTMLInputElement | null;
        if (!keyEl || !valueEl) return;
        const key = keyEl.value;
        const value = valueEl.value;
        if (key && value) {
            queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    });

    const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    urlInput.value = baseUrl + queryString;
}

// Add event listener to URL input to sync the table in real-time
if (urlInput) {
    urlInput.addEventListener("input", syncTableWithURL);
}

// Synchronize the parameters table with the current URL input
function syncTableWithURL(): void {
    if (!urlInput || !parametersTable) return;
    let url: URL;
    try {
        url = new URL(urlInput.value, window.location.origin);
    } catch {
        // Invalid URL, don't sync
        return;
    }
    const params = new URLSearchParams(url.search);

    // Clear existing rows in the parameters table
    const tbody = parametersTable.querySelector("tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    // Populate table with parameters from the URL
    params.forEach((value, key) => {
        const newRow = tbody.insertRow();
        newRow.classList.add("data-row");
        newRow.innerHTML = `
            <td class="data-cell"><input class="param-cell-input border-background-non" placeholder="key" value="${escapeHtml(decodeURIComponent(key))}" name="key"></td>
            <td class="data-cell">
                <input class="param-cell-input border-background-non" placeholder="value" value="${escapeHtml(decodeURIComponent(value))}" name="value">
            </td>
            <td class="data-cell">
                <div class="flex-box">
                    <input class="param-cell-input border-background-non" placeholder="description" value="" name="description">
                    <h6 class="delete-text-btn" data-action="deleteParamRow">delete</h6>
                </div>
            </td>`;
    });

    if (params.size === 0) {
        addRowWithQueryParamListeners();
    }
}

const copyRequest = async (): Promise<void> => {
    if (!urlInput || !methodSelect || !urlInput.value || !methodSelect.value) {
        return showToast("Request is empty!");
    }
    let url;
    try {
        url = new URL(decodeURIComponent(urlInput.value))
    } catch (error) {
        return showToast("Invalid url!");
    }
    const method = methodSelect.value;
    const headers = getHeaders();
    const headersList = Object.keys(headers).map(key => ({ key, value: headers[key].value, description: headers[key].description }));

    const params = getParams();
    const paramsList = Object.keys(params).map(key => ({ key, value: params[key].value, description: params[key].description }));



    let bodyType = bodyTypeSelectElement?.value || 'json';
    let bodyData;
    if (method !== "get") {
        const body = getBody();

        if (body instanceof FormData && formBodyData) {
            try {
                let data: Record<string, any> = JSON.parse(convertFormBodyToJson(body, formBodyData));
                bodyData = Object.entries(data).map(([key, value]) => ({
                    key,
                    value: value?.value,
                    type: value?.type
                }));
            } catch {
                return showToast("Invalid form body data.");
            }
        } else if (typeof body === "string") {
            try {
                let data: Record<string, any> = JSON.parse(body);
                bodyData = Object.entries(data).map(([key, value]) => ({
                    key,
                    value
                }));
            } catch {
                return showToast("Invalid JSON body.");
            }
        }

    }

    const object = {
        path: url.origin + url.pathname,
        method: method.toUpperCase(),
        summary: "",
        headers: headersList,
        parameters: paramsList,
        body: method !== "get" ? {
            type: bodyType,
            data: bodyData
        } : undefined,
        responses: [],
    }


    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(JSON.stringify(object, null, 4))
        } else {
            return showToast("copy function works only on secure connections. (localhost or https)");

        }

        showToast("Request Copied.");
    } catch (err) {
        console.error('Failed to copy: ', err);
        showToast("Failed to copy request.");
    }
}


const copyResponse = async (): Promise<void> => {
    try {
        const statusCode = document.getElementById("playground_statusCode");
        const respBody = document.getElementById("playground_respBody");
        if (!statusCode || !respBody) {
            return showToast("No response to copy.");
        }
        const headers = getResponseHeaders();
        const bodyText = respBody.textContent || '';
        const bodyValue = isValidJson(bodyText) ? JSON.parse(bodyText) : bodyText;

        const responseObj = {
            status: statusCode.innerHTML ? Number(statusCode.innerHTML) : null,
            description: "Example Response:",
            value: bodyValue,
            headers
        };

        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(JSON.stringify(responseObj, null, 4));
        } else {
            return showToast("copy function works only on secure connections. (localhost or https)");

        }
        showToast("Response Copied.");

    } catch (err) {
        console.error('Failed to copy: ', err);
        showToast("Failed to copy response.");
    }
};

function getResponseHeaders(): { key: string, value: string }[] {
    const headers: { key: string, value: string }[] = [];
    if (!responseHeadersTable) return headers;
    const rows = responseHeadersTable.querySelectorAll("tr.data-row");

    rows.forEach(row => {
        const keyEl = row.querySelector('span[name="key"]');
        const valueEl = row.querySelector('span[name="value"]');
        if (!keyEl || !valueEl) return;
        const key = keyEl.textContent || '';
        const value = valueEl.textContent || '';
        if (key && value) {
            headers.push({ key, value })
        }
    });
    return headers
}

// Event delegation for CSP compliance
function initPlaygroundEventDelegation(): void {
    document.addEventListener('click', handlePlaygroundClick);
    document.addEventListener('input', handlePlaygroundInput);
    document.addEventListener('change', handlePlaygroundChange);
    document.addEventListener('keyup', handlePlaygroundKeyup);

    // Form submit
    const form = document.getElementById('playground-form') as HTMLFormElement;
    if (form) {
        form.addEventListener('submit', sendRequest);
    }

    // Event delegation for parameters table - prevents memory leak from adding listeners on each sync
    if (parametersTable) {
        parametersTable.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target.name === 'key' || target.name === 'value') {
                updateURL();
            }
        });
    }
}

function handlePlaygroundClick(e: Event): void {
    const target = (e.target as HTMLElement).closest('[data-action]');
    if (!target) return;

    const dataset = (target as HTMLElement).dataset;
    const action = dataset.action;
    switch (action) {
        case 'deleteParamRow':
            deleteParamRow(target as HTMLElement);
            break;
        case 'deleteRow':
            deleteRow(target as HTMLElement);
            break;
        case 'showTab':
            if (dataset.endpoint && dataset.wrapper && dataset.tab) {
                showTab(dataset.endpoint, dataset.wrapper, dataset.tab);
            }
            break;
        case 'copyRequest':
            copyRequest();
            break;
        case 'copyResponse':
            copyResponse();
            break;
        case 'addRowWithQueryParamListeners':
            addRowWithQueryParamListeners();
            break;
        case 'addHeaderRow':
            addRow('headersTable');
            break;
        case 'addReqBodyRow':
            addReqBodyRow();
            break;
        case 'hideToast':
            hideToast();
            break;
    }
}

function handlePlaygroundInput(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.dataset.action === 'updateFormValueKey') {
        updateFormValueKey(target as HTMLInputElement);
    }
}

function handlePlaygroundChange(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.dataset.action === 'changeBodyFormInputType') {
        changeBodyFormInputType(target as HTMLSelectElement);
    }
}

function handlePlaygroundKeyup(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.dataset.action === 'formatJson' && target.dataset.id) {
        setupFormatJsonInterval(target.dataset.id);
    }
}

function changeBodyFormInputType(selectElement: HTMLSelectElement): void {
    const valueInput = selectElement.closest('.data-row')?.querySelector('.value-input') as HTMLInputElement | null;
    if (valueInput) {
        valueInput.type = selectElement.value;
    }
}

initPlaygroundEventDelegation();