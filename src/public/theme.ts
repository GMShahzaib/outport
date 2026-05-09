// Theme switcher: applies the saved or system-preferred theme before paint
// (loaded synchronously from <head>) and exposes a global toggleTheme()
// invoked via [data-action="toggleTheme"].

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'outport-theme';

const readStoredTheme = (): Theme | null => {
    try {
        const value = localStorage.getItem(THEME_STORAGE_KEY);
        return value === 'light' || value === 'dark' ? value : null;
    } catch {
        return null;
    }
};

const systemPrefersDark = (): boolean => {
    return typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyTheme = (theme: Theme): void => {
    document.documentElement.setAttribute('data-theme', theme);
    syncTogglePressedState(theme);
};

const syncTogglePressedState = (theme: Theme): void => {
    if (typeof document === 'undefined' || !document.body) return;
    document.querySelectorAll<HTMLButtonElement>('[data-action="toggleTheme"]').forEach(btn => {
        btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    });
};

const initialTheme: Theme = readStoredTheme() ?? (systemPrefersDark() ? 'dark' : 'light');
applyTheme(initialTheme);

const toggleTheme = (): void => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
        // ignore storage errors (private mode, quota, etc.)
    }
};

// Follow OS theme changes when the user has not made an explicit choice.
if (typeof window.matchMedia === 'function') {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent): void => {
        if (readStoredTheme() === null) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    };
    if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', onChange);
    } else if (typeof (mq as any).addListener === 'function') {
        (mq as any).addListener(onChange);
    }
}

// The script runs in <head> before the toggle button exists, so re-sync once
// the DOM is parsed.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => syncTogglePressedState(initialTheme));
}

const resolveActiveTheme = (): Theme =>
    readStoredTheme() ?? (systemPrefersDark() ? 'dark' : 'light');

// Re-apply the saved theme when the page is restored from the browser's
// back/forward cache — otherwise navigating back keeps the stale theme until
// a hard reload.
window.addEventListener('pageshow', (event) => {
    if (event.persisted) applyTheme(resolveActiveTheme());
});

// Pick up changes made in other tabs/pages of the same origin.
window.addEventListener('storage', (event) => {
    if (event.key === THEME_STORAGE_KEY) applyTheme(resolveActiveTheme());
});

// Expose for the click handlers in render-content.ts / playground.ts.
(window as any).toggleTheme = toggleTheme;
