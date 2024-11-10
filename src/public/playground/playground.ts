// Element references
const bodyTypeSelectElement = document.getElementById('playground_request_body_type') as HTMLSelectElement;
const jsonDiv = document.getElementById('request_body_json') as HTMLDivElement;
const formDiv = document.getElementById('request_body_form') as HTMLDivElement;
const jsonBodyInput = (document.getElementById(`playground_json_input_body`) as HTMLTextAreaElement)
const formBodyData = document.getElementById(`playground_form_body`) as HTMLFormElement
const parametersTable = document.getElementById("parametersTable") as HTMLTableElement;
const headersTable = document.getElementById("headersTable") as HTMLTableElement;
const urlInput = document.getElementById("playground-url-input") as HTMLInputElement;
const methodSelect = (document.getElementById("playground-method-selector") as HTMLSelectElement)

// Initial setup
jsonDiv.style.display = 'block';

// Change request body type
bodyTypeSelectElement.addEventListener('change', toggleRequestBodyType);


window.onload = function (): void {
    const params = getUrlParams(window.location.search);
    loadUrl(params.url);
    loadMethod(params.method);
    loadHeaders(params.headers);
    loadBodyType(params.bodyType);
    loadBody(params.bodyType, params.body);
};

function loadUrl(url?: string): void {
    if (url) {
        urlInput.value = decodeURIComponent(url);
        syncTableWithURL();
    }
}

function loadMethod(method?: string): void {
    if (method) {
        methodSelect.value = method.toLowerCase();
    }
}

function loadHeaders(headers?: string): void {
    if (headers) {
        const headerObj = JSON.parse(headers);
        const headersTableBody = document.querySelector<HTMLTableSectionElement>('#headersTable tbody');

        if (headersTableBody) {
            headersTableBody.innerHTML = "";
        }

        Object.keys(headerObj).forEach(key => {
            addRow("headersTable", key, headerObj[key]);
        });
    }
}

function loadBodyType(bodyType?: string): void {
    if (bodyType) {
        bodyTypeSelectElement.value = bodyType;
        toggleRequestBodyType();
    }
}

function loadBody(bodyType?: string, body?: string): void {
    if (body) {
        if (bodyType === "json") {
            jsonBodyInput.innerHTML = body;
            formatJson(jsonBodyInput);
        } else if (bodyType === "form") {
            const formData = JSON.parse(body)

            const formDataTableBody = document.querySelector<HTMLTableSectionElement>(`#playground_form_body_table tbody`) as HTMLTableSectionElement;

            if (formDataTableBody) {
                formDataTableBody.innerHTML = "";
            }

            Object.keys(formData).forEach(key => {
                addReqBodyRow(key, formData[key]?.type, formData[key]?.value)
            })
        }
    }
}

function getUrlParams(queryString: string): Record<string, string> {
    const params = new URLSearchParams(queryString);
    const result: Record<string, string> = {};

    for (const [key, value] of params.entries()) {
        try {
            result[key] = decodeURIComponent(value);
        } catch (e) {
            console.error(`Failed to decode URI component for key ${key}: ${e}`);
            result[key] = value;
        }
    }

    return result;
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
    const isJson = bodyTypeSelectElement.value === 'json';
    jsonDiv.style.display = isJson ? 'block' : 'none';
    formDiv.style.display = isJson ? 'none' : 'block';
}

function changeBodyFormInputType(selectElement: HTMLSelectElement): void {
    const inputField = selectElement.closest('td')?.nextElementSibling?.querySelector('input');
    if (inputField) {
        inputField.type = selectElement.value;
    }
}

function addRowWithQueryParamListeners(): void {
    addRow("parametersTable");
    initializeRealTimeURLUpdate();
}

function addRow(tableId: string, key?: string, value?: string): void {
    const tableBody = document.querySelector<HTMLTableSectionElement>(`#${tableId} tbody`);
    if (tableBody) {
        const newRow = document.createElement('tr');
        newRow.classList.add('data-row');
        newRow.innerHTML = `
            <td class="data-cell"><input class="param-cell-input border-background-non" value="${key || ""}" placeholder="key" name="key"></td>
            <td class="data-cell">
                <div class="flex-box">
                    <input class="param-cell-input border-background-non" placeholder="value" name="value" value="${value || ""}">
                    <h6 class="delete-text-btn" onclick="deleteRow(this)">delete</h6>
                </div>
            </td>`;
        tableBody.appendChild(newRow);
    }
}

function addReqBodyRow(key?: string, valueType?: string, value?: string): void {
    const tableBody = document.querySelector<HTMLTableSectionElement>(`#playground_form_body_table tbody`) as HTMLTableSectionElement;
    const newRow = document.createElement('tr');
    newRow.classList.add('data-row');

    newRow.innerHTML = `
        <td class="data-cell">
            <div class="flex-box">
                <input class="param-cell-input border-background-non key-input" value="${key || ""}" placeholder="key" oninput="updateFormValueKey(this)">
                <select class="border-background-non" onchange="changeBodyFormInputType(this)" value="${valueType || ""}">
                    <option value="text">TEXT</option>
                    <option value="file">FILE</option>
                </select>
            </div>
        </td>
        <td class="data-cell">
            <div class="flex-box">
                <input type="${valueType || "text"}" value="${value || ""}" class="param-cell-input border-background-non value-input" placeholder="value" name="value" accept="image/*">
                <h6 class="delete-text-btn" onclick="deleteRow(this)">delete</h6>
            </div>
        </td>
    `;

    tableBody.appendChild(newRow);
}

function deleteRow(element: HTMLElement): void {
    element.closest('tr')?.remove();
    updateURL();
}

async function sendRequest(): Promise<void> {
    const responseUnavailable = document.getElementById(`playground-response-unavailable`) as HTMLDivElement;
    const responseSection = document.getElementById(`playground-response-section`) as HTMLDivElement;
    const loader = document.getElementById(`playground-executeBtn-loader`) as HTMLDivElement;

    responseUnavailable.classList.add("displayNon");
    responseSection.classList.add("displayNon");
    loader.classList.remove("displayNon");

    const url = urlInput.value;
    const method = methodSelect.value;
    const headers = getHeaders();
    const body = method !== "get" ? getBody() : undefined;

    try {
        const { success, errorMessage, data, headers: respHeaders, status, time } = await testApi({
            path: url,
            method,
            headers,
            body,
            timeout: 60000
        });

        if (!success) {
            showToast(errorMessage || "Something went wrong!");
        } else if (errorMessage === "Request Time Out!") {
            responseUnavailable.classList.remove("displayNon");
        } else {
            updateUIWithResponse("playground", time, status as number, respHeaders as { [key: string]: string }, data as string);
            responseSection.classList.remove("displayNon");
        }
    } catch (error) {
        showToast("An unexpected error occurred!");
    } finally {
        loader.classList.add("displayNon");
    }
}

function getBody() {
    let requestBody
    const value = bodyTypeSelectElement.value

    const isJson = value == "json"
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

function getHeaders() {
    const headers: { [key: string]: string } = {};
    const rows = headersTable.querySelectorAll("tr.data-row");

    rows.forEach(row => {
        const key = (row.querySelector('input[name="key"]') as HTMLInputElement).value;
        const value = (row.querySelector('input[name="value"]') as HTMLInputElement).value;
        if (key && value) {
            headers[key] = value;
        }
    });
    return headers
}

function initializeRealTimeURLUpdate(): void {
    initializeInputListeners(parametersTable);
}

function initializeInputListeners(parametersTable: HTMLTableElement): void {
    const keyInputs = parametersTable.querySelectorAll<HTMLInputElement>('input[name="key"]');
    const valueInputs = parametersTable.querySelectorAll<HTMLInputElement>('input[name="value"]');

    keyInputs.forEach(input => input.addEventListener("input", updateURL));
    valueInputs.forEach(input => input.addEventListener("input", updateURL));
}

function updateURL(): void {
    let baseUrl = urlInput.getAttribute("data-base-url") || urlInput.value.split("?")[0];
    urlInput.setAttribute("data-base-url", baseUrl);  // Store the original base URL

    const queryParams: string[] = [];
    const rows = parametersTable.querySelectorAll("tr.data-row");

    rows.forEach(row => {
        const key = (row.querySelector('input[name="key"]') as HTMLInputElement).value;
        const value = (row.querySelector('input[name="value"]') as HTMLInputElement).value;
        if (key && value) {
            queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    });

    const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
    urlInput.value = baseUrl + queryString;
}

// Add event listener to URL input to sync the table in real-time
urlInput.addEventListener("input", syncTableWithURL);

// Synchronize the parameters table with the current URL input
function syncTableWithURL(): void {
    const url = new URL(urlInput.value, window.location.origin);
    const params = new URLSearchParams(url.search);

    // Clear existing rows in the parameters table
    parametersTable.querySelector("tbody")!.innerHTML = "";

    // Populate table with parameters from the URL
    params.forEach((value, key) => {
        const newRow = parametersTable.querySelector("tbody")!.insertRow();
        newRow.classList.add("data-row");
        newRow.innerHTML = `
            <td class="data-cell"><input class="param-cell-input border-background-non" placeholder="key" value="${decodeURIComponent(key)}" name="key"></td>
            <td class="data-cell">
                <div class="flex-box">
                    <input class="param-cell-input border-background-non" placeholder="value" value="${decodeURIComponent(value)}" name="value">
                    <h6 class="delete-text-btn" onclick="deleteRow(this)">delete</h6>
                </div>
            </td>`;
    });

    if (params.size === 0) {
        addRowWithQueryParamListeners();
    }

    // Reinitialize listeners for the new inputs
    initializeInputListeners(parametersTable);
}

initializeRealTimeURLUpdate();
