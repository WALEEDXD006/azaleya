export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value.trim()) return `${label} is required.`;
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Full name is required.';
  if (/\d/.test(name)) return 'Full name cannot contain numbers.';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return null;
  const cleaned = phone.replace(/[\s-]/g, '');
  const re = /^\+?\d{8,15}$/;
  if (!re.test(cleaned)) return 'Please enter a valid phone number.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export function validatePrice(value: string): string | null {
  if (!value) return 'Price is required.';
  const n = Number(value);
  if (isNaN(n)) return 'Price must be a number.';
  if (n < 0) return 'Price cannot be negative.';
  return null;
}

export function validateRating(rating: number): string | null {
  if (!rating || rating < 1 || rating > 5) return 'Please select a rating.';
  return null;
}

export function validatePostalCode(postal: string): string | null {
  if (!postal.trim()) return null;
  const re = /^\d{4,6}$/;
  if (!re.test(postal.trim())) return 'Please enter a valid postal code (4-6 digits).';
  return null;
}
