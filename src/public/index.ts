// Toggle content visibility
const toggleContent = (id: string): void => {
    const content = document.getElementById(id) as HTMLElement;
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
};

// Get selected base URL
const getSelectedBaseUrl = (): string => {
    return (document.getElementById('baseUrlSelector') as HTMLSelectElement).value;
};

const showModal = (): void => {
    setModalVisibility("myModal", true);
}

const hideModal = (): void => {
    setModalVisibility("myModal", false);
}

const setModalVisibility = (modalId: string, isVisible: boolean): void => {
    const modal = document.getElementById(modalId) as HTMLElement;
    modal.style.display = isVisible ? "block" : "none";
}

// Show toast message
const showToast = (message: string): void => {
    updateToast(message, true);
    setTimeout(hideToast, 8000); // Hide toast after 8 seconds
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

// Validate if string is JSON
const isValidJson = (str: string): boolean => {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
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

// Get request header
const getRequestHeaders = (endpointId: string): { [key: string]: string } => {
    const headers: { [key: string]: string } = {};

    const requestHeaders = document.getElementById(`${endpointId}_request_headers_body`) as HTMLElement;
    const inputs = document.querySelectorAll<HTMLInputElement>('input[header-data-key]');

    inputs.forEach(input => {
        const key = input.getAttribute('header-data-key') || '';
        headers[key] = input.value;
    });

    if (requestHeaders) {
        Array.from(requestHeaders.getElementsByTagName("tr")).forEach(tr => {
            const key = (tr.getElementsByTagName('td')[0].firstElementChild as HTMLInputElement).value;
            const value = (tr.getElementsByTagName('td')[1].firstElementChild as HTMLInputElement).value;
            headers[key] = value;
        });
    }

    return headers;
};

// Get query parameters
const getAddressWithParameters = (endpointId: string, path: string): string => {
    const variables = extractVariablesFromUrl(path);
    variables.forEach((key: string) => {
        const value = (document.getElementById(`${endpointId}_${key}_value`) as HTMLInputElement).value;
        path = path.replace(`{${key}}`, value);
    });
    return path;
};

function extractVariablesFromUrl(urlTemplate: string): string[] {
    const regex = /{(\w+)}/g;
    const variables: string[] = [];
    let match;
    while ((match = regex.exec(urlTemplate)) !== null) {
        variables.push(match[1]);
    }
    return variables;
}

// Get query parameters
const getQueryParameters = (endpointId: string): string => {
    const paramBody = document.getElementById(`${endpointId}_query_params_body`) as HTMLElement;
    return Array.from(paramBody.getElementsByTagName("tr"))
        .map(tr => {
            const key = (tr.getElementsByTagName('td')[0].firstElementChild as HTMLInputElement).value;
            const value = (tr.getElementsByTagName('td')[1].firstElementChild as HTMLInputElement).value;
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .join('&');
};

// Main function to send API request
const execute = async (
    endpointId: string,
    path: string,
    method: string = 'GET',
    timeout: number = 5000
): Promise<void> => {

    let requestBody;
    const params = getQueryParameters(endpointId);
    const pathWithParams = getAddressWithParameters(endpointId, path);
    const headers = getRequestHeaders(endpointId);
    const completePath = `${pathWithParams}${params ? `?${params}` : ''}`;


    if (method !== "GET") {

        const value = (document.getElementById(`${endpointId}_body_type_selector`) as HTMLSelectElement).value

        const isJson = value == "json"
        if (isJson) {
            const body = (document.getElementById(`${endpointId}_json_input_body`) as HTMLTextAreaElement).value;
            if (body && !isValidJson(body)) {
                showErrorOnBody(endpointId);
                return;
            }
            requestBody = body && JSON.stringify(JSON.parse(body));
            removeErrorOnBody(endpointId);
        } else {
            const formData = document.getElementById(`${endpointId}_form_input_body`) as HTMLFormElement
            requestBody = new FormData(formData)
        }
    }

    console.log({ path: completePath, method, headers, body: requestBody, timeout });

    document.getElementById(`${endpointId}_response`)?.classList.add("displayNon");

    try {
        const baseUrl = getSelectedBaseUrl();
        const fullUrl = `${baseUrl}${completePath}`;
        const options = buildFetchOptions(method, headers, requestBody);

        const response = await fetchWithTimeout(fullUrl, options, timeout);
        const respHeaders = Object.fromEntries(response.headers.entries());
        const data = await parseResponse(response);

        updateUIWithResponse(endpointId, response.status, respHeaders, data);
    } catch (error: unknown) {
        if (error instanceof Error) {
            showToast(error.message);
            console.error(error);
        }
    }
};

const showErrorOnBody = (endpointId: string): void => {
    (document.getElementById(`${endpointId}_json_input_body`) as HTMLTextAreaElement).classList.add("body-input-error");
};

const removeErrorOnBody = (endpointId: string): void => {
    (document.getElementById(`${endpointId}_json_input_body`) as HTMLTextAreaElement).classList.remove("body-input-error");
};

// Build fetch options
const buildFetchOptions = (
    method: string,
    headers: Record<string, string>,
    body?: string | FormData
): RequestInit => {
    const options: RequestInit = { method: method.toUpperCase(), headers: { ...headers } };
    if (body && ['POST', 'PUT'].includes(method.toUpperCase())) {
        options.body = body;
        options.headers = { ...options.headers };
    }
    return options;
};

// Update UI with response
const updateUIWithResponse = (
    endpointId: string,
    status: number,
    headers: { [key: string]: string },
    data: string
): void => {
    updateElement(`${endpointId}_statusCode`, String(status));
    updateTable(`${endpointId}_response_headers`, headers);
    updateElement(`${endpointId}_respBody`, data);

    document.getElementById(`${endpointId}_response`)?.classList.remove("displayNon");
};

const updateElement = (id: string, content: string): void => {
    (document.getElementById(id) as HTMLElement).innerHTML = content;
};

const updateTable = (id: string, headers: { [key: string]: string }): void => {
    const rows = Object.keys(headers).map(key => `
        <tr class="data-row">
          <td class="data-cell whiteBorder"><span class="response-header-key">${key}</span></td>
          <td class="data-cell whiteBorder"><span class="response-header-value">${headers[key]}</span></td>
        </tr>
    `).join('');
    updateElement(id, rows);
};

// Parse API response based on content type
const parseResponse = async (response: Response): Promise<string> => {
    const contentType = response.headers.get('content-type');
    return contentType && contentType.includes('application/json')
        ? JSON.stringify(await response.json(), null, 2)
        : await response.text();
};

// Fetch with timeout
const fetchWithTimeout = (url: string, options: RequestInit, timeout: number): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    options.signal = controller.signal;

    return fetch(url, options).finally(() => clearTimeout(timer));
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
