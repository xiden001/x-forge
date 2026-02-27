export const debounce = <T extends unknown[]>(fn: (...args: T) => void, delayMs: number): ((...args: T) => void) => {
  let timeout: NodeJS.Timeout | undefined;

  return (...args: T) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
};
