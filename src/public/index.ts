// Toggle content visibility
const toggleContent = (id: string): void => {
    const content = document.getElementById(id) as HTMLElement;
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
};

// Get selected base URL
const getSelectedBaseUrl = (): string => {
    const selector = document.getElementById('baseUrlSelector') as HTMLSelectElement;
    return selector.value;
};

// Show toast message
const showToast = (message: string): void => {
    const toast = document.getElementById('toast') as HTMLElement;
    const toastText = document.getElementById('toast-text') as HTMLElement;
    toastText.innerHTML = message;
    toast.classList.add('show-toast');
    setTimeout(hideToast, 8000); // Hide toast after 8 seconds
};

// Hide toast message
const hideToast = (): void => {
    const toast = document.getElementById('toast') as HTMLElement;
    const toastText = document.getElementById('toast-text') as HTMLElement;
    toastText.innerHTML = "";
    toast.classList.remove('show-toast');
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

const setupFormatJsonInterval = (id: string): void => {
    const ele = document.getElementById(id) as HTMLTextAreaElement;
    clearTimeout(typingTimer);
    if (ele.value) typingTimer = window.setTimeout(() => formatJson(ele), doneTypingInterval);
};

// Format JSON
const formatJson = (ele: HTMLTextAreaElement): void => {
    if (isValidJson(ele.value)) {
        const formatted = JSON.stringify(JSON.parse(ele.value), null, 2);
        ele.value = formatted;
    }
};

// Get request header
const getRequestHeaders = (endpointId: string): { [key: string]: string } => {
    const headers: { [key: string]: string } = {}

    const request_headers = document.getElementById(`${endpointId}_request_headers_body`) as HTMLElement;
    const global_request_headers = document.getElementById(`${endpointId}_global_request_headers_body`) as HTMLElement;

    if(request_headers){
        Array.from(request_headers.getElementsByTagName("tr")).forEach(tr => {
            const key = (tr.getElementsByTagName('td')[0].firstElementChild as HTMLInputElement).value;
            const value = (tr.getElementsByTagName('td')[1].firstElementChild as HTMLInputElement).value;
            headers[key] = value
        });
    }
    if(global_request_headers){
        Array.from(global_request_headers.getElementsByTagName("tr")).forEach(tr => {
            const key = (tr.getElementsByTagName('td')[0].firstElementChild as HTMLInputElement).value;
            const value = (tr.getElementsByTagName('td')[1].firstElementChild as HTMLInputElement).value;
            headers[key] = value
        });     
    }
    

    return headers
};

// Get query parameters
const getAddressWithParameters = (endpointId: string, path: string): string => {
    let pathWithParams = path

    const variables = extractVariablesFromUrl(path)

    variables.forEach((key: string) => {
        const value = (document.getElementById(`${endpointId}_${key}_value`) as HTMLInputElement).value;
        pathWithParams = pathWithParams.replace(`{${key}}`, value)
    })

    return pathWithParams
};

function extractVariablesFromUrl(urlTemplate: string) {
    const regex = /{(\w+)}/g;
    let matches, variables = [];

    while ((matches = regex.exec(urlTemplate)) !== null) {
        variables.push(matches[1]);
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
    const body = (document.getElementById(`${endpointId}_input_body`) as HTMLTextAreaElement).value;

    if (body && !isValidJson(body)) {
        (document.getElementById(`${endpointId}_input_body`) as HTMLTextAreaElement).classList.add("body-input-error");
        return;
    }
    (document.getElementById(`${endpointId}_input_body`) as HTMLTextAreaElement).classList.remove("body-input-error");

    let params = getQueryParameters(endpointId);

    const pathWithParams = getAddressWithParameters(endpointId, path)
    const headers = getRequestHeaders(endpointId)

    const completePath = `${pathWithParams}${params ? `?${params}` : ''}`;
    const parsedBody = body ? JSON.parse(body) : undefined;

    console.log({ path: completePath, method, headers, body: parsedBody, timeout });

    document.getElementById(`${endpointId}_response`)?.classList.add("displayNon")


    try {
        const baseUrl = getSelectedBaseUrl();
        const fullUrl = `${baseUrl}${completePath}`;
        const options = buildFetchOptions(method, headers, parsedBody);

        const response = await fetchWithTimeout(fullUrl, options, timeout);

        const respHeaders = Object.fromEntries(response.headers.entries());
        const data = await parseResponse(response);
        const curlCommand = constructCurlCommand(method, fullUrl, headers, parsedBody);

        updateUIWithResponse(endpointId, response.status, curlCommand, respHeaders, data);
    } catch (error: unknown) {
        if (error instanceof Error) {
            showToast(error.message);
            console.error(error);
        }
    }
};

// Build fetch options
const buildFetchOptions = (
    method: string,
    headers: Record<string, string>,
    body?: Record<string, unknown>
): RequestInit => {
    const options: RequestInit = { method: method.toUpperCase(), headers: { ...headers } };
    if (body && ['POST', 'PUT'].includes(method.toUpperCase())) {
        options.body = JSON.stringify(body);
        options.headers = { ...options.headers, 'Content-Type': 'application/json' };
    }
    return options;
};

// Update UI with response
const updateUIWithResponse = (
    endpointId: string,
    status: number,
    curlCommand: string,
    headers: { [key: string]: string },
    data: string
): void => {
    (document.getElementById(`${endpointId}_statusCode`) as HTMLElement).innerHTML = String(status);
    (document.getElementById(`${endpointId}_curl`) as HTMLElement).innerHTML = `<pre>${curlCommand}</pre>`;
    (document.getElementById(`${endpointId}_response_headers`) as HTMLElement).innerHTML = Object.keys(headers).map(key => `
        <tr class="data-row">
          <td class="data-cell whiteBorder"><span class="response-header-key">${key}</span></td>
          <td class="data-cell whiteBorder"><span class="response-header-value">${headers[key]}</span></td>
        </tr>
        `).join('');
    (document.getElementById(`${endpointId}_respBody`) as HTMLElement).textContent = data;


    document.getElementById(`${endpointId}_response`)?.classList.remove("displayNon")
};

// Construct CURL command
const constructCurlCommand = (
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: Record<string, unknown>
): string => {
    let curl = `curl -X ${method.toUpperCase()} '${url}'`;
    Object.entries(headers).forEach(([key, value]) => {
        curl += ` -H '${key}: ${value}'`;
    });
    if (body) curl += ` -d '${JSON.stringify(body)}'`;
    return curl;
};

// Parse API response based on content type
const parseResponse = async (response: Response): Promise<string> => {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return JSON.stringify(await response.json(), null, 2);
    }
    return await response.text();
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

    Array.from(wrapperEle.getElementsByTagName('div')).forEach(tab => tab && tab.classList.remove('active'));
    Array.from(content.getElementsByTagName('div')).forEach(tab => tab && tab.classList.remove('active'));

    (document.getElementById(`${endpointId}_${tabName}_tab`) as HTMLElement).classList.add('active');
    (document.getElementById(`${endpointId}_${tabName}_content`) as HTMLElement).classList.add('active');
};
