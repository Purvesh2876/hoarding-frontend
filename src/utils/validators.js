// Validation helpers and keypress guards

export const isAllowedNavigationKey = (event) => {
    const navigationKeys = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        'Tab', 'Home', 'End', 'Enter'
    ];
    return event.ctrlKey || event.metaKey || navigationKeys.includes(event.key);
};

export const allowDigitsOnly = (event) => {
    if (isAllowedNavigationKey(event)) return;
    const isDigit = /[0-9]/.test(event.key);
    if (!isDigit) {
        event.preventDefault();
    }
};

export const allowPrice = (event, currentValue) => {
    if (isAllowedNavigationKey(event)) return;
    const isDigit = /[0-9]/.test(event.key);
    const isDot = event.key === '.';
    if (isDigit) return;
    if (isDot) {
        if (!currentValue || currentValue.includes('.')) {
            event.preventDefault();
        }
        return;
    }
    event.preventDefault();
};

export const allowAlphaSpaces = (event) => {
    if (isAllowedNavigationKey(event)) return;
    const ok = /[a-zA-Z\s.]/.test(event.key);
    if (!ok) event.preventDefault();
};

export const allowEmailChars = (event) => {
    if (isAllowedNavigationKey(event)) return;
    const ok = /[a-zA-Z0-9@._-]/.test(event.key);
    if (!ok) event.preventDefault();
};

export const trimValue = (value) => (value || '').trim();

export const isNonEmpty = (value) => trimValue(value).length > 0;

export const isValidEmail = (value) => {
    const v = trimValue(value);
    if (!v) return false;
    // Simple but effective email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
};

export const isPositiveInteger = (value) => {
    const v = trimValue(value);
    if (!v) return false;
    return /^\d+$/.test(v) && Number(v) > 0;
};

export const isNonNegativeNumber = (value) => {
    const v = trimValue(value);
    if (!v) return false;
    return /^(\d+)(\.\d+)?$/.test(v) && Number(v) >= 0;
};

export const collectErrors = (checks) => {
    // checks: array of {valid:boolean, message:string}
    return checks.filter(c => !c.valid).map(c => c.message);
};


