export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export function isStrongPassword(password) {
    return password.length >= 8;
}
