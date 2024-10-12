// Toggle content visibility
const toggleContent = (id) => {
    const content = document.getElementById(id);
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
};

// Get selected base URL
const getSelectedBaseUrl = () => document.getElementById('baseUrlSelector').value;

// Show toast message
const showToast = (message) => {
    const toast = document.getElementById('toast');
    document.getElementById('toast-text').innerHTML = message;
    toast.classList.add('show-toast');
    setTimeout(hideToast, 8000); // Hide toast after 8 seconds
};

// Hide toast message
const hideToast = () => {
    const toast = document.getElementById('toast');
    document.getElementById('toast-text').innerHTML = "";
    toast.classList.remove('show-toast');
};

// Validate if string is JSON
const isValidJson = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
};

// Setup typing timer for JSON formatting
let typingTimer;
const doneTypingInterval = 2500;

const setupFormatJsonInterval = (id) => {
    const ele = document.getElementById(id);
    clearTimeout(typingTimer);
    if (ele.value) typingTimer = setTimeout(() => formatJson(ele), doneTypingInterval);
};

// Format JSON
const formatJson = (ele) => {
    if (isValidJson(ele.value)) {
        const formatted = JSON.stringify(JSON.parse(ele.value), null, 2);
        ele.value = formatted;
    }
};

// Format JSON
const getQueryParameters = (endpointId) => {
    const paramBody = document.getElementById(`${endpointId}_param_body`);

    return Array.from(paramBody.getElementsByTagName("tr"))
        .map(tr => {
            const key = tr.getElementsByTagName('td')[0].firstElementChild.value;
            const value = tr.getElementsByTagName('td')[1].firstElementChild.value;
            return `${key}=${value}`;
        })
        .join('&');
};


// Main function to send API request
const testApi = async (endpointId, path, method = 'GET', headers = {}, timeout = 5000) => {
    const body = document.getElementById(`${endpointId}_input_body`).value;

    if (body && !isValidJson(body)) {
        document.getElementById(`${endpointId}_input_body`).classList.add("body-input-error");
        return;
    }
    document.getElementById(`${endpointId}_input_body`).classList.remove("body-input-error");

    let params = getQueryParameters(endpointId)

    const completePath = `${path}${params ? `?${params}` : ''}`;
    const parsedBody = body ? JSON.parse(body) : undefined;

    console.log({ path: completePath, method, headers, body: parsedBody, timeout });

    hideElements(endpointId);

    try {
        const baseUrl = getSelectedBaseUrl();
        const fullUrl = `${baseUrl}${completePath}`;
        const options = buildFetchOptions(method, headers, parsedBody);

        const response = await fetchWithTimeout(fullUrl, options, timeout);
        const respHeaders = JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2);
        const data = await parseResponse(response);
        const curlCommand = constructCurlCommand(method, fullUrl, headers, parsedBody);

        updateUIWithResponse(endpointId, response.status, curlCommand, respHeaders, data);
    } catch (error) {
        showToast(error.message);
        console.error(error);
    }
};

// Hide response elements
const hideElements = (endpointId) => {
    ['statusCode', 'curl', 'respHeaders', 'respBody'].forEach(key => {
        document.getElementById(`${endpointId}_${key}_wrapper`).style.display = 'none';
    });
};

// Build fetch options
const buildFetchOptions = (method, headers, body) => {
    const options = { method: method.toUpperCase(), headers };
    if (body && ['POST', 'PUT'].includes(method.toUpperCase())) {
        options.body = JSON.stringify(body);
        options.headers['Content-Type'] = 'application/json';
    }
    return options;
};

// Update UI with response
const updateUIWithResponse = (endpointId, status, curlCommand, headers, data) => {
    document.getElementById(`${endpointId}_statusCode`).innerHTML = status;
    document.getElementById(`${endpointId}_curl`).innerHTML = `<pre>${curlCommand}</pre>`;
    document.getElementById(`${endpointId}_respHeaders`).textContent = headers;
    document.getElementById(`${endpointId}_respBody`).textContent = data;

    ['statusCode', 'curl', 'respHeaders', 'respBody'].forEach(key => {
        document.getElementById(`${endpointId}_${key}_wrapper`).style.display = 'block';
    });
};

// Construct CURL command
const constructCurlCommand = (method, url, headers, body) => {
    let curl = `curl -X ${method.toUpperCase()} '${url}'`;
    Object.entries(headers).forEach(([key, value]) => {
        curl += ` -H '${key}: ${value}'`;
    });
    if (body) curl += ` -d '${JSON.stringify(body)}'`;
    return curl;
};

// Parse API response based on content type
const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    if (contentType.includes('application/json')) return JSON.stringify(await response.json(), null, 2);
    return await response.text();
};

// Fetch with timeout
const fetchWithTimeout = (url, options, timeout) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    options.signal = controller.signal;

    return fetch(url, options).finally(() => clearTimeout(timer));
};

// Show selected tab content
const showTab = (endpointId, tabName) => {
    const wrapper = document.getElementById(`${endpointId}_header_warper`);
    const content = document.getElementById(`${endpointId}_header_content`);

    Array.from(wrapper.getElementsByTagName('div')).forEach(tab => tab.classList.remove('active'));
    Array.from(content.getElementsByTagName('div')).forEach(tab => tab.classList.remove('active'));

    document.getElementById(`${endpointId}_${tabName}_tab`).classList.add('active');
    document.getElementById(`${endpointId}_${tabName}_content`).classList.add('active');
};
