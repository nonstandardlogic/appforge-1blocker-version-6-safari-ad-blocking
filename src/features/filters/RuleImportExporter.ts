import { CustomRule } from './types';
import { CustomRuleValidator } from './CustomRuleValidator';

export interface SkippedRule {
  line: string;
  reason: string;
}

export interface ImportResult {
  imported: CustomRule[];
  skipped: SkippedRule[];
}

export class RuleImportExporter {
  private readonly validator = new CustomRuleValidator();

  exportRules(rules: CustomRule[]): string {
    return rules
      .filter(r => r.enabled)
      .map(r => r.pattern)
      .join('\n');
  }

  importRules(content: string, existing: CustomRule[] = []): ImportResult {
    const existingPatterns = new Set(existing.map(r => r.pattern));
    const lines = content
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#'));

    const imported: CustomRule[] = [];
    const skipped: SkippedRule[] = [];

    for (const line of lines) {
      if (existingPatterns.has(line)) {
        skipped.push({ line, reason: 'Duplicate — rule already exists' });
        continue;
      }
      const result = this.validator.validate(line);
      if (!result.valid) {
        skipped.push({ line, reason: result.error! });
        continue;
      }
      const rule: CustomRule = {
        id: `imported-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        pattern: line,
        enabled: true,
        createdAt: new Date().toISOString(),
      };
      imported.push(rule);
      existingPatterns.add(line);
    }

    return { imported, skipped };
  }
}
