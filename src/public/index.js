// Toggle content visibility
function toggleContent(id) {
    const content = document.getElementById(id);
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
}

function getSelectedBaseUrl() {
    const selectElement = document.getElementById('baseUrlSelector');
    return selectElement.value;
}


// Main function to send API request
async function testApi({ endpoint, method = 'GET', headers = {}, body = null, timeout = 5000 }) {
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
        const respHeaders = Object.fromEntries(response.headers.entries());

        // Parse the response
        const data = await parseResponse(response);

        // Check for non-OK status codes and throw errors if necessary
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Construct the equivalent CURL command
        const curlCommand = constructCurlCommand(method, fullUrl, headers, body);

        // Return both the response data and headers along with the curl command
        return {
            status: response.status,
            data,
            headers: respHeaders,
            curl: curlCommand
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Rethrow the error after logging it
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
        data = await response.json(); // JSON Response
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
        throw error; // Rethrow other fetch-related errors
    } finally {
        clearTimeout(id);
    }
}


// Example usage of the testApi function
(async () => {
    const result = await testApi({
        endpoint: '/test',
        method: 'GET',
        headers: {},
        body: {}
    });

    console.log("Response Status Code:", result.status)
    console.log('Response Data:', result.data);
    console.log('Response Headers:', result.headers);
    console.log('Equivalent CURL Command:', result.curl);
})();
