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