const goToPlaygroundWithoutData = (): void => {
  // Remove the item from sessionStorage
  sessionStorage.removeItem('playgroundData');

  // Redirect the user to the playground page
  window.location.href = 'playground';
}

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


// Main function to send API request
const execute = async (
  endpointId: string,
  path: string,
  method: string = 'GET',
  timeout?: number
): Promise<void> => {
  const executeBtn = document.getElementById(`${endpointId}_executeBtn`) as HTMLButtonElement;
  const loader = document.getElementById(`${endpointId}_executeBtn_loader`) as HTMLDivElement;
  const responseSection = document.getElementById(`${endpointId}_response`) as HTMLDivElement;

  // Toggle button and loader visibility
  executeBtn.style.display = "none";
  loader.style.display = "block";

  const baseUrl = getSelectedBaseUrl();
  const params = getQueryParameters(endpointId)

  const urlParams = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key].value)}`).join('&');

  let fullUrl = `${getAddressWithParameters(endpointId, path)}${urlParams ? `?${urlParams}` : ''}`
  if (!isValidHttpUrl(path)) {
    fullUrl = `${baseUrl}` + fullUrl
  }
  const headerList = getRequestHeaders(endpointId);

  let headers: Record<string, string> = {}

  Object.keys(headerList).forEach(key => {
    headers[key] = headerList[key].value
  });

  const body = getRequestBody(method, endpointId);

  responseSection?.classList.add("displayNon");

  try {
    const { success, errorMessage, data, headers: respHeaders, status, time } = await testApi({
      path: fullUrl,
      method,
      headers,
      body: body?.body,
      timeout,
    });

    if (!success) {
      showToast(errorMessage || "Something went wrong!");
    } else if (errorMessage !== "Request Time Out!") {
      updateUIWithResponse(endpointId, time, status as number, respHeaders as { [key: string]: string }, data as string);
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
  } finally {
    // Reset button and loader visibility
    executeBtn.style.display = "block";
    loader.style.display = "none";
  }
};

function loadDataToPlayground(endpointId: string, path: string, method: string) {
  const baseUrl = getSelectedBaseUrl();
  const params = getQueryParameters(endpointId)
  const urlParams = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key].value)}`).join('&');

  let fullUrl = `${path}${urlParams ? `?${urlParams}` : ''}`
  if (!isValidHttpUrl(path)) {
    fullUrl = `${baseUrl}` + fullUrl;
  }

  const headers = getRequestHeaders(endpointId);

  const requestBody = getRequestBody(method, endpointId);

  let body;
  if (requestBody?.body instanceof FormData) {
    const formDataBodyElement = document.getElementById(`${endpointId}_form_input_body`) as HTMLFormElement
    body = convertFormBodyToJson(requestBody?.body, formDataBodyElement)
  } else {
    body = requestBody?.body
  }

  // Store data in sessionStorage
  const payload = {
    method,
    url: fullUrl,
    headers,
    params,
    body,
    bodyType: requestBody?.type,
  };
  sessionStorage.setItem('playgroundData', JSON.stringify(payload));

  document.location.href = 'playground'
}

// Get request header
const getRequestHeaders = (endpointId: string): { [key: string]: { value: string, description: string } } => {
  const headers: { [key: string]: { value: string, description: string } } = {};

  const requestHeaders = document.getElementById(`${endpointId}_request_headers_body`) as HTMLElement;
  const inputs = document.querySelectorAll<HTMLInputElement>('input[header-data-key]');

  inputs.forEach(input => {
    const key = input.getAttribute('header-data-key') || '';
    const description = (document.getElementById(`${key}_description`) as HTMLParagraphElement).innerHTML
    headers[key] = { value: input.value, description };
  });

  if (requestHeaders) {
    const rows = requestHeaders.querySelectorAll("tr.data-row");

    rows.forEach(row => {
      const key = (row.querySelector('input[name="key"]') as HTMLInputElement).value;
      const value = (row.querySelector('input[name="value"]') as HTMLInputElement).value;
      const description = (row.querySelector('input[name="description"]') as HTMLInputElement).value;
      if (key && value) {
        headers[key] = { value, description };
      }
    });
  }

  return headers;
};

// Get selected base URL
const getSelectedBaseUrl = (): string => {
  return (document.getElementById('baseUrlSelector') as HTMLSelectElement).value;
};

function getQueryParameters(endpointId: string) {
  const params: { [key: string]: { value: string, description: string } } = {};

  const paramBody = document.getElementById(`${endpointId}_query_params_body`) as HTMLElement;
  const rows = paramBody.querySelectorAll("tr.data-row");

  rows.forEach(row => {
    const key = (row.querySelector('input[name="key"]') as HTMLInputElement).value;
    const value = (row.querySelector('input[name="value"]') as HTMLInputElement).value;
    const description = (row.querySelector('input[name="description"]') as HTMLInputElement).value;
    if (key && value) {
      params[key] = { value, description };
    }
  });
  return params
}

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



function getRequestBody(method: string, endpointId: string) {
  if (method === "GET") return

  const bodyTypeSelector = document.getElementById(`${endpointId}_body_type_selector`) as HTMLSelectElement;
  const bodyType = bodyTypeSelector?.value;

  if (!bodyType) return

  if (bodyType === "json") {
    const jsonInputBody = document.getElementById(`${endpointId}_json_input_body`) as HTMLTextAreaElement;
    const body = jsonInputBody?.value;

    if (body && !isValidJson(body)) {
      showErrorOnBody(endpointId);
      return;
    }
    removeErrorOnBody(endpointId);
    return { type: bodyType, body: JSON.stringify(JSON.parse(body)) };
  } else {
    const formData = document.getElementById(`${endpointId}_form_input_body`) as HTMLFormElement;
    return { type: bodyType, body: new FormData(formData) };
  }
}