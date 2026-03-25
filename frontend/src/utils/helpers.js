export function getRequiredEnv(name) {
    const value = import.meta.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
export function getDisplayName(firstName, lastName) {
    const full = [firstName, lastName].filter(Boolean).join(' ').trim();
    return full || 'User';
}
