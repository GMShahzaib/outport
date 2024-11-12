// Validate if string is JSON
const isValidJson = (str: string): boolean => {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
};

const showErrorOnBody = (endpointId: string): void => {
    (document.getElementById(`${endpointId}_json_input_body`) as HTMLTextAreaElement).classList.add("body-input-error");
};

const removeErrorOnBody = (endpointId: string): void => {
    (document.getElementById(`${endpointId}_json_input_body`) as HTMLTextAreaElement).classList.remove("body-input-error");
};


// Show selected tab content
const showTab = (endpointId: string, wrapper: string, tabName: string): void => {
    const wrapperEle = document.getElementById(`${endpointId}_${wrapper}_tabs`) as HTMLElement;
    const content = document.getElementById(`${endpointId}_${wrapper}_content`) as HTMLElement;

    toggleActiveTab(wrapperEle, content, `${endpointId}_${tabName}`);
};

const toggleActiveTab = (wrapperEle: HTMLElement, content: HTMLElement, activeTabId: string): void => {
    Array.from(wrapperEle.children).forEach(child => child.classList.remove('active'));
    Array.from(content.children).forEach(child => child.classList.remove('active'));

    document.getElementById(`${activeTabId}_tab`)?.classList.add('active');
    document.getElementById(`${activeTabId}_content`)?.classList.add('active');
};


// Toggle content visibility
const toggleContent = (id: string): void => {
    const content = document.getElementById(id) as HTMLElement;
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
};



// Setup typing timer for JSON formatting
let typingTimer: number;
const doneTypingInterval = 2500;

const setupFormateJsonInterval = (id: string): void => {
    const ele = document.getElementById(id) as HTMLTextAreaElement;
    clearTimeout(typingTimer);
    if (ele.value) typingTimer = window.setTimeout(() => formatJson(ele), doneTypingInterval);
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
    const toast = document.getElementById('toast') as HTMLElement;
    const toastText = document.getElementById('toast-text') as HTMLElement;
    toastText.innerHTML = message;
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
    (document.getElementById(id) as HTMLElement).innerHTML = content;
};

const updateTable = (id: string, headers: { [key: string]: string }): void => {
    if (!headers) return
    const rows = Object.keys(headers).map(key => `
        <tr class="data-row">
          <td class="data-cell whiteBorder"><span name="key"  class="response-header-key">${key}</span></td>
          <td class="data-cell whiteBorder"><span name="value" class="response-header-value">${headers[key]}</span></td>
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
        if (typeof value == "string") {
            obj[key].value = value
        }
    });

    return JSON.stringify(obj);
}

function isValidHttpUrl(value: string) {
    let url;

    try {
        url = new URL(value);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}


function hideElement(id: string) {
    (document.getElementById(id) as HTMLDivElement).classList.add("displayNon");
}

function showElement(id: string) {
    (document.getElementById(id) as HTMLDivElement).classList.remove("displayNon");
}
