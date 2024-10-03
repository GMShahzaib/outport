// Toggle content visibility
function toggleContent(id) {
    const content = document.getElementById(id);
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
}

function getSelectedBaseUrl() {
    const selectElement = document.getElementById('baseUrlSelector');
    return selectElement.value;
}
// Show the toast
function showToast(message) {
    const toastText = document.getElementById('toast-text');
    toastText.innerHTML = message
    document.getElementById('toast').classList.add('show-toast');

    // Hide the toast automatically after 8 seconds
    setTimeout(hideToast, 8000);
}

// Hide the toast
function hideToast() {
    const toastText = document.getElementById('toast-text');
    toastText.innerHTML = ""
    document.getElementById('toast').classList.remove('show-toast');
}


// Main function to send API request
async function testApi({ endpoint, method = 'GET', headers = {}, body = null, timeout = 5000 }, respDestination) {
    document.getElementById(`${respDestination}_statusCode_wrapper`).style.display = "none";
    document.getElementById(`${respDestination}_curl_wrapper`).style.display = "none";
    document.getElementById(`${respDestination}_respHeaders_wrapper`).style.display = "none";
    document.getElementById(`${respDestination}_respBody_wrapper`).style.display = "none";

    try {
        const baseUrl = getSelectedBaseUrl()
        // Construct the full URL
        const fullUrl = `${baseUrl}${endpoint}`;

        // Prepare options for fetch
        const options = {
            method: method.toUpperCase(),
            headers: headers
        };

        // Add body if it's a POST or PUT request
        if (body && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
            options.body = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json'; // Ensure JSON content type
        }

        // Set a timeout for the fetch request
        const response = await fetchWithTimeout(fullUrl, options, timeout);
        const respHeaders = JSON.stringify(Object.fromEntries(response.headers.entries()), undefined, 2);

        // Parse the response
        const data = await parseResponse(response);

        // Construct the equivalent CURL command
        const curlCommand = constructCurlCommand(method, fullUrl, headers, body);

        // Return both the response data and headers along with the curl command
        const statusCodeEle = document.getElementById(`${respDestination}_statusCode`)
        statusCodeEle.innerHTML = response.status
        document.getElementById(`${respDestination}_statusCode_wrapper`).style.display = "block";

        const curlEle = document.getElementById(`${respDestination}_curl`)
        curlEle.innerHTML = `<pre>${curlCommand}</pre>`
        document.getElementById(`${respDestination}_curl_wrapper`).style.display = "block";

        const respHeaderEle = document.getElementById(`${respDestination}_respHeaders`)
        respHeaderEle.textContent = respHeaders
        document.getElementById(`${respDestination}_respHeaders_wrapper`).style.display = "block";

        const respBodyEle = document.getElementById(`${respDestination}_respBody`)
        respBodyEle.textContent = data
        document.getElementById(`${respDestination}_respBody_wrapper`).style.display = "block";

    } catch (error) {
        showToast(error.message)
        console.log(error)
    }
}

// Helper function to construct a CURL command from the request details
function constructCurlCommand(method, url, headers, body) {
    let curl = `curl -X ${method.toUpperCase()} '${url}'`;

    // Add headers to curl command
    if (headers && typeof headers === 'object') {
        for (const [key, value] of Object.entries(headers)) {
            curl += ` -H '${key}: ${value}'`;
        }
    }

    // Add body to curl command
    if (body && (method.toUpperCase() === 'POST' || method.toUpperCase() === 'PUT')) {
        curl += ` -d '${JSON.stringify(body)}'`;
    }

    return curl;
}

// Helper function to handle different content types
async function parseResponse(response) {
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
        const respData = await response.json(); // JSON Response
        data = JSON.stringify(respData, undefined, 2)
    } else if (contentType && contentType.includes('text/html')) {
        data = await response.text(); // HTML Response
    } else if (contentType && contentType.includes('application/xml')) {
        data = await response.text(); // XML Response as text
    } else {
        data = await response.text(); // Default fallback to text
    }

    return data;
}

// Helper function to implement timeout for fetch requests
async function fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    options.signal = controller.signal;

    try {
        const response = await fetch(url, options);
        return response;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        showToast(error.message)
        console.log(error)
        throw error
    } finally {
        clearTimeout(id);
    }
}