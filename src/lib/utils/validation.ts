export function validateEan(ean: string): boolean {
  // EAN-13 or EAN-8 validation
  if (!/^\d{8}$|^\d{13}$/.test(ean)) {
    return false;
  }

  // Checksum validation
  const digits = ean.split('').map(Number);
  const checksum = digits.pop();
  if (checksum === undefined) {
    return false;
  }
  const sum = digits.reduce((acc, digit, i) => {
    return acc + digit * (i % 2 === 0 ? 1 : 3);
  }, 0);

  return (10 - (sum % 10)) % 10 === checksum;
}

export function validateGuid(guid: string): boolean {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(guid);
}

export function sanitizeHtml(html: string): string {
  // Basic sanitization - in production use DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}
