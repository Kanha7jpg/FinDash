export function getRequiredEnv(name: 'VITE_API_BASE_URL'): string {
  const value = import.meta.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getDisplayName(firstName?: string | null, lastName?: string | null): string {
  const full = [firstName, lastName].filter(Boolean).join(' ').trim();
  return full || 'User';
}
