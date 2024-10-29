// Element references
const selectElement = document.getElementById('playground_request_body_type') as HTMLSelectElement;
const jsonDiv = document.getElementById('request_body_json') as HTMLDivElement;
const formDiv = document.getElementById('request_body_form') as HTMLDivElement;
const parametersTable = document.getElementById("parametersTable") as HTMLTableElement;
const urlInput = document.getElementById("playground-url-input") as HTMLInputElement;

// Initial setup
jsonDiv.style.display = 'block';

// Change request body type
selectElement.addEventListener('change', toggleRequestBodyType);

function toggleRequestBodyType(): void {
    const isJson = selectElement.value === 'json';
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

function addRow(tableId: string): void {
    const tableBody = document.querySelector<HTMLTableSectionElement>(`#${tableId} tbody`);
    if (tableBody) {
        const newRow = document.createElement('tr');
        newRow.classList.add('data-row');
        newRow.innerHTML = `
            <td class="data-cell"><input class="param-cell-input border-background-non" placeholder="key" name="key"></td>
            <td class="data-cell">
                <div class="flex-box">
                    <input class="param-cell-input border-background-non" placeholder="value" name="value">
                    <h6 class="delete-text-btn" onclick="deleteRow(this)">delete</h6>
                </div>
            </td>`;
        tableBody.appendChild(newRow);
    }
}

function addReqBodyRow(): void {
    const tableBody = document.querySelector<HTMLTableSectionElement>(`#bodyTable tbody`);
    if (tableBody) {
        const newRow = document.createElement('tr');
        newRow.classList.add('data-row');
        newRow.innerHTML = `
            <td class="data-cell">
                <div class="flex-box">
                    <input class="param-cell-input border-background-non" placeholder="key" name="key">
                    <select class="border-background-non" onchange="changeBodyFormInputType(this)">
                        <option value="text">TEXT</option>
                        <option value="file">FILE</option>
                    </select>
                </div>
            </td>
            <td class="data-cell">
                <div class="flex-box">
                    <input type="text" class="param-cell-input border-background-non" placeholder="value" accept="image/*">
                    <h6 class="delete-text-btn" onclick="deleteRow(this)">delete</h6>
                </div>
            </td>`;
        tableBody.appendChild(newRow);
    }
}

function deleteRow(element: HTMLElement): void {
    element.closest('tr')?.remove();
    updateURL();
}

async function sendRequest(): Promise<void> {
    const url = urlInput.value;
    const method = (document.getElementById("playground-method-selector") as HTMLSelectElement).value;
    const response = await testApi({ path: url, method });
    console.log(response)
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
