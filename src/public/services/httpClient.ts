const testApi = async (data: {
    path: string,
    method: string,
    headers?: Record<string, string>,
    body?: string | FormData,
    timeout?: number,
}
): Promise<{ success: boolean, errorMessage?: string, status?: number; headers?: { [k: string]: string; }; data?: string; }> => {

    const { path, method = 'GET', headers = {}, body, timeout = 5000 } = data

    console.log({ path, method, headers, body, timeout });

    try {
        const options = buildFetchOptions(method, headers, body);

        const response = await fetchWithTimeout(path, options, timeout);
        const respHeaders = Object.fromEntries(response.headers.entries());
        const data = await parseResponse(response);

        return {
            success: true,
            status: response.status,
            headers: respHeaders,
            data
        }
    } catch (error: unknown) {
        const errorResp: { success: boolean, errorMessage?: string } = { success: false }
        if (error instanceof Error) {
            errorResp.errorMessage = error.message
        }
        return errorResp
    }
};

// Build fetch options
const buildFetchOptions = (
    method: string,
    headers: Record<string, string>,
    body?: string | FormData
): RequestInit => {
    const options: RequestInit = { method: method.toUpperCase(), headers };
    if (body && ['POST', 'PUT'].includes(method.toUpperCase())) {
        options.body = body;
    }
    return options;
};


// Fetch with timeout
const fetchWithTimeout = (url: string, options: RequestInit, timeout: number): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    options.signal = controller.signal;

    return fetch(url, options).finally(() => clearTimeout(timer));
};

// Parse API response based on content type
const parseResponse = async (response: Response): Promise<string> => {
    const contentType = response.headers.get('content-type');
    return contentType && contentType.includes('application/json')
        ? JSON.stringify(await response.json(), null, 2)
        : await response.text();
};
