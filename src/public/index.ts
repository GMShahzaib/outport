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


// Get selected base URL
const getSelectedBaseUrl = (): string => {
    return (document.getElementById('baseUrlSelector') as HTMLSelectElement).value;
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
    method: string = 'GET'
): Promise<void> => {

    let requestBody;
    const params = getQueryParameters(endpointId);
    const pathWithParams = getAddressWithParameters(endpointId, path);
    const headers = getRequestHeaders(endpointId);
    const baseUrl = getSelectedBaseUrl();
    const fullUrl = `${baseUrl}${pathWithParams}${params ? `?${params}` : ''}`;

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

    document.getElementById(`${endpointId}_response`)?.classList.add("displayNon");

    try {
        const { success, errorMessage, data, headers: respHeaders, status } = await testApi({ path: fullUrl, method, headers, body: requestBody })

        if (!success) {
            showToast(errorMessage || "Something went wrong!");
        }

        updateUIWithResponse(endpointId, status as number, respHeaders as { [k: string]: string; }, data as string);
    } catch (error: unknown) {
        console.error(error);
    }
};