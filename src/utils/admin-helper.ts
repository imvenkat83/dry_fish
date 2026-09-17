/**
 * Utility for parsing and validating administrative phone numbers.
 * Supports comma-separated admin phone numbers from the ADMIN_NUMBERS environment variable.
 */

export function getAdminPhones(): string[] {
  const envVal = process.env.ADMIN_NUMBERS || "";
  return envVal
    .split(",")
    .map((num) => num.replace(/\D/g, "").slice(-10)) // Normalizes to 10 digits
    .filter((num) => num.length === 10);
}


export function isAdminPhone(phone: string): boolean {
  if (!phone) return false;
  // Normalize the input phone number (strip country prefix +91 and non-digits, take last 10 digits)
  const normalizedInput = phone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
  const adminPhones = getAdminPhones();
  return adminPhones.includes(normalizedInput);
}

