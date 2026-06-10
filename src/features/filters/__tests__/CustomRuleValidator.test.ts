import { CustomRuleValidator } from '../CustomRuleValidator';

describe('CustomRuleValidator — NSL1V6SAB-24', () => {
  let validator: CustomRuleValidator;

  beforeEach(() => {
    validator = new CustomRuleValidator();
  });

  it('returns valid=false for empty string', () => {
    expect(validator.validate('').valid).toBe(false);
  });

  it('returns error message for empty string', () => {
    const result = validator.validate('');
    expect(result.error).toMatch(/empty/i);
  });

  it('returns valid=false for whitespace-only string', () => {
    expect(validator.validate('   ').valid).toBe(false);
  });

  it('returns valid=false for pattern shorter than 3 characters', () => {
    const result = validator.validate('ab');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('returns valid=false for invalid regex', () => {
    const result = validator.validate('[invalid-regex');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/valid regular expression/i);
  });

  it('returns valid=true for a simple domain pattern', () => {
    expect(validator.validate('ads.example.com').valid).toBe(true);
  });

  it('returns valid=true for a URL path pattern', () => {
    expect(validator.validate('example.com/ads/').valid).toBe(true);
  });

  it('returns valid=true for a regex URL filter', () => {
    expect(validator.validate('.*\\.doubleclick\\.net').valid).toBe(true);
  });

  it('valid result has no error field', () => {
    const result = validator.validate('example.com/tracker');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('returns valid=true for a 3-character pattern', () => {
    expect(validator.validate('abc').valid).toBe(true);
  });
});
