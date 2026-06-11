export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class CustomRuleValidator {
  validate(pattern: string): ValidationResult {
    const trimmed = pattern.trim();
    if (!trimmed) {
      return { valid: false, error: 'Rule pattern cannot be empty' };
    }
    if (trimmed.length < 3) {
      return { valid: false, error: 'Rule pattern must be at least 3 characters' };
    }
    try {
      new RegExp(trimmed);
    } catch {
      return { valid: false, error: 'Rule pattern is not a valid regular expression' };
    }
    return { valid: true };
  }
}
