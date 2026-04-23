export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()\-_=+[\]{}|;':",.<>?/\\]).{8,16}$/;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validatePassword(value: string) {
  return {
    length: value.length >= 8 && value.length <= 16,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    digit: /[0-9]/.test(value),
    special: /[!@#$%^&*()\-_=+[\]{}|;':",.<>?/\\]/.test(value),
  };
}

export function createPseudoChecker(checkFn: (pseudo: string) => Promise<boolean>) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let inFlight = false;

  return (pseudo: string, callback: (available: boolean) => void) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const available = await checkFn(pseudo);
        callback(available);
      } finally {
        inFlight = false;
      }
    }, 1000);
  };
}
