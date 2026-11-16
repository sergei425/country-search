export function debounce(fn, delay) {
    let timerId;
    return (...args) => {
        if (timerId !== undefined) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}
