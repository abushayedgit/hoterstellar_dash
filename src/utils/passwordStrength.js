export const PASSWORD_CRITERIA = Object.freeze([
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'digit', label: 'One number', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
]);

export const scorePassword = (password = '') => {
  const checks = PASSWORD_CRITERIA.map((c) => ({ ...c, passed: c.test(password) }));
  const score = checks.filter((c) => c.passed).length;
  return { score, checks };
};
