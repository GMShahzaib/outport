const testApi = async (data: {
    path: string,
    method: string,
    headers?: Record<string, string>,
    body?: string | FormData,
    timeout?: number,
    signal?: AbortSignal,
}
): Promise<{ success: boolean, time: string, errorMessage?: string, status?: number; headers?: { [k: string]: string; }; data?: string; }> => {
    const startTime = Date.now()

    const { path, method = 'GET', headers = {}, body, timeout = 10000, signal } = data

    try {
        const options = buildFetchOptions(method, headers, body);

        const response = await fetchWithTimeout(path, options, timeout, signal);
        const respHeaders = Object.fromEntries(response.headers.entries());
        const responseData = await parseResponse(response);

        const time = convertMillSecToReadable(Date.now() - startTime);


        return {
            success: true,
            time,
            status: response.status,
            headers: respHeaders,
            data: responseData
        }
    } catch (error: unknown) {
        const errorResp: { success: boolean, time: string, errorMessage?: string } = { success: false, time: convertMillSecToReadable(Date.now() - startTime) }
        if (typeof error === 'string') {
            errorResp.errorMessage = error
        }
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
    const modifiedHeaders = { ...headers };

    // Set Content-Type header if body is a string
    if (body && typeof body === 'string') {
        modifiedHeaders['Content-Type'] = 'application/json';
    }

    const options: RequestInit = {
        method: method.toUpperCase(),
        headers: modifiedHeaders,
    };

    // Add the body only if it's a POST or PUT request
    if (body && ['POST', 'PUT','PATCH','DELETE'].includes(method.toUpperCase())) {
        options.body = body;
    }

    return options;
};

function convertMillSecToReadable(ms: number): string {
    const milliseconds = ms % 1000;
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    let time = ""
    if (hours) {
        time += `${hours}h`
    }
    if (minutes) {
        if (time) time += ", "
        time += `${minutes}m`
    }
    if (seconds) {
        if (time) time += ", "
        time += `${seconds}s`
    }
    if (milliseconds) {
        if (time) time += ", "
        time += `${milliseconds}ms`
    }

    return time || "0ms"
}


// Fetch with timeout
const fetchWithTimeout = (url: string, options: RequestInit, timeout: number, externalSignal?: AbortSignal): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort("Request Time Out!"), timeout);

    // If external signal is provided, abort when it aborts
    if (externalSignal) {
        if (externalSignal.aborted) {
            controller.abort("Request cancelled");
        } else {
            externalSignal.addEventListener('abort', () => controller.abort("Request cancelled"), { once: true });
        }
    }

    options.signal = controller.signal;

    return fetch(url, options).finally(() => clearTimeout(timer));
};

// Parse API response based on content type
const parseResponse = async (response: Response): Promise<string> => {
    const contentType = response.headers.get('content-type');
    // Always read as text first (can only read body once)
    const text = await response.text();

    if (contentType && contentType.includes('application/json')) {
        try {
            const jsonData = JSON.parse(text);
            return JSON.stringify(jsonData, null, 2);
        } catch {
            // Server sent wrong Content-Type or malformed JSON
            return text;
        }
    }
    return text;
};
