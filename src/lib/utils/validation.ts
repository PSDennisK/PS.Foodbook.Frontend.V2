import DOMPurify from 'isomorphic-dompurify';

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
  // Use DOMPurify for robust HTML sanitization
  // Prevents XSS attacks by removing malicious scripts and event handlers
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}
