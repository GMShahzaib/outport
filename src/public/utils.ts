// Validate if string is JSON
const isValidJson = (str: string): boolean => {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
};

// Escape HTML to prevent XSS
const escapeHtml = (str: string | undefined | null): string => {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const showErrorOnBody = (endpointId: string): void => {
    document.getElementById(`${endpointId}_json_input_body`)?.classList.add("body-input-error");
};

const removeErrorOnBody = (endpointId: string): void => {
    document.getElementById(`${endpointId}_json_input_body`)?.classList.remove("body-input-error");
};


// Show selected tab content
const showTab = (endpointId: string, wrapper: string, tabName: string): void => {
    const wrapperEle = document.getElementById(`${endpointId}_${wrapper}_tabs`);
    const content = document.getElementById(`${endpointId}_${wrapper}_content`);

    if (!wrapperEle || !content) return;
    toggleActiveTab(wrapperEle, content, `${endpointId}_${tabName}`);
};

const toggleActiveTab = (wrapperEle: HTMLElement, content: HTMLElement, activeTabId: string): void => {
    for (const child of wrapperEle.children) {
        child.classList.remove('active');
    }
    for (const child of content.children) {
        child.classList.remove('active');
    }

    document.getElementById(`${activeTabId}_tab`)?.classList.add('active');
    document.getElementById(`${activeTabId}_content`)?.classList.add('active');
};


// Toggle content visibility
const toggleContent = (id: string): void => {
    const content = document.getElementById(id);
    if (content) {
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
    }
};



// Setup typing timer for JSON formatting
const typingTimers: Map<string, number> = new Map();
const doneTypingInterval = 2500;

const setupFormatJsonInterval = (id: string): void => {
    const ele = document.getElementById(id) as HTMLTextAreaElement | null;
    if (!ele) return;

    const existingTimer = typingTimers.get(id);
    if (existingTimer !== undefined) {
        clearTimeout(existingTimer);
    }
    if (ele.value) {
        const timer = window.setTimeout(() => formatJson(ele), doneTypingInterval);
        typingTimers.set(id, timer);
    } else {
        typingTimers.delete(id);
    }
};

// Format JSON
const formatJson = (ele: HTMLTextAreaElement): void => {
    if (isValidJson(ele.value)) {
        ele.value = JSON.stringify(JSON.parse(ele.value), null, 2);
    }
};

// Show toast message
const showToast = (message: string): void => {
    updateToast(message, true);
    setTimeout(hideToast, 3000); // Hide toast after 3 seconds
};

// Hide toast message
const hideToast = (): void => {
    updateToast("", false);
};

const updateToast = (message: string, show: boolean): void => {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;

    toastText.textContent = message;
    toast.classList.toggle('show-toast', show);
};



// Update UI with response
const updateUIWithResponse = (
    endpointId: string,
    time: string,
    status: number,
    headers: { [key: string]: string },
    data: string
): void => {
    const div = document.createElement('div');
    div.textContent = data;
    updateElement(`${endpointId}_statusCode`, String(status));
    updateElement(`${endpointId}_resp_time`, time);
    updateTable(`${endpointId}_response_headers`, headers);
    updateElement(`${endpointId}_respBody`, div.innerHTML);

    document.getElementById(`${endpointId}_response`)?.classList.remove("displayNon");
};

const updateElement = (id: string, content: string): void => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = content;
};

const updateTable = (id: string, headers: { [key: string]: string }): void => {
    if (!headers) return
    const rows = Object.keys(headers).map(key => `
        <tr class="data-row">
          <td class="data-cell whiteBorder"><span name="key"  class="response-header-key">${escapeHtml(key)}</span></td>
          <td class="data-cell whiteBorder"><span name="value" class="response-header-value">${escapeHtml(headers[key])}</span></td>
        </tr>
    `).join('');
    updateElement(id, rows);
};

function convertFormBodyToJson(formData: FormData, formElement: HTMLFormElement): string {
    const obj: { [key: string]: { value?: string; type: string } } = {};

    formData.forEach((value, key) => {
        const inputElement = formElement.querySelector(`[name="${key}"]`) as HTMLInputElement | null;
        const type = inputElement ? inputElement.type : "unknown";

        obj[key] = { type }
        if (typeof value === "string") {
            obj[key].value = value
        }
    });

    return JSON.stringify(obj);
}

function isValidHttpUrl(value: string): boolean {
    let url;

    try {
        url = new URL(value);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}


function hideElement(id: string): void {
    document.getElementById(id)?.classList.add("displayNon");
}

function showElement(id: string): void {
    document.getElementById(id)?.classList.remove("displayNon");
}

function addRow(tableId: string, key?: string, value?: string, description?: string): void {
    const table = document.getElementById(tableId);
    const tableBody = table?.querySelector('tbody');
    if (!tableBody) return;

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
                        <h6 class="delete-text-btn" data-action="deleteRow">delete</h6>
                    </div>
                </td>
                `;
    tableBody.appendChild(newRow);
}


function deleteRow(element: HTMLElement): void {
    element.closest('tr')?.remove();
}