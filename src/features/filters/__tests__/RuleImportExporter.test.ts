import { RuleImportExporter } from '../RuleImportExporter';
import { CustomRule } from '../types';

function makeRule(id: string, pattern: string, enabled = true): CustomRule {
  return { id, pattern, enabled, createdAt: '2026-06-10T00:00:00.000Z' };
}

describe('RuleImportExporter — NSL1V6SAB-25', () => {
  let exporter: RuleImportExporter;

  beforeEach(() => {
    exporter = new RuleImportExporter();
  });

  describe('exportRules', () => {
    it('exports enabled rules as newline-separated patterns', () => {
      const rules = [makeRule('1', 'ads.example.com'), makeRule('2', 'tracker.net')];
      expect(exporter.exportRules(rules)).toBe('ads.example.com\ntracker.net');
    });

    it('excludes disabled rules from export', () => {
      const rules = [makeRule('1', 'ads.example.com', true), makeRule('2', 'disabled.com', false)];
      expect(exporter.exportRules(rules)).toBe('ads.example.com');
    });

    it('returns empty string when rules list is empty', () => {
      expect(exporter.exportRules([])).toBe('');
    });

    it('returns empty string when all rules are disabled', () => {
      expect(exporter.exportRules([makeRule('1', 'ads.com', false)])).toBe('');
    });

    it('preserves rule order in exported output', () => {
      const rules = [makeRule('1', 'aaa.com'), makeRule('2', 'bbb.com'), makeRule('3', 'ccc.com')];
      expect(exporter.exportRules(rules)).toBe('aaa.com\nbbb.com\nccc.com');
    });
  });

  describe('importRules', () => {
    it('imports valid rules from newline-separated text', () => {
      const result = exporter.importRules('ads.example.com\ntracker.net');
      expect(result.imported).toHaveLength(2);
      expect(result.skipped).toHaveLength(0);
    });

    it('each imported rule has id, enabled=true, and valid createdAt', () => {
      const result = exporter.importRules('ads.example.com');
      expect(result.imported[0].id).toBeTruthy();
      expect(result.imported[0].enabled).toBe(true);
      expect(new Date(result.imported[0].createdAt).toISOString()).toBe(result.imported[0].createdAt);
    });

    it('skips rules that duplicate existing list entries', () => {
      const existing = [makeRule('1', 'ads.example.com')];
      const result = exporter.importRules('ads.example.com\nnew-tracker.net', existing);
      expect(result.imported).toHaveLength(1);
      expect(result.imported[0].pattern).toBe('new-tracker.net');
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0].reason).toMatch(/duplicate/i);
    });

    it('skips comment lines starting with #', () => {
      const result = exporter.importRules('# this is a comment\nads.example.com');
      expect(result.imported).toHaveLength(1);
      expect(result.imported[0].pattern).toBe('ads.example.com');
    });

    it('skips blank lines', () => {
      const result = exporter.importRules('ads.example.com\n\n\ntracker.net');
      expect(result.imported).toHaveLength(2);
    });

    it('skips invalid rules and includes reason in skipped summary', () => {
      const result = exporter.importRules('[invalid-regex\nads.example.com');
      expect(result.imported).toHaveLength(1);
      expect(result.skipped).toHaveLength(1);
      expect(result.skipped[0].line).toBe('[invalid-regex');
      expect(result.skipped[0].reason).toBeTruthy();
    });

    it('handles intra-file duplicate lines', () => {
      const result = exporter.importRules('ads.example.com\nads.example.com');
      expect(result.imported).toHaveLength(1);
      expect(result.skipped).toHaveLength(1);
    });

    it('returns correct counts for mixed valid/invalid/duplicate content', () => {
      const existing = [makeRule('e1', 'existing.com')];
      const result = exporter.importRules(
        '[bad\ngood.example.com\nexisting.com\n[also-bad',
        existing
      );
      expect(result.imported).toHaveLength(1);
      expect(result.skipped).toHaveLength(3);
    });

    it('import result is usable with importRules Redux action (pattern check)', () => {
      const result = exporter.importRules('ads.example.com\ntracker.net');
      result.imported.forEach(rule => {
        expect(rule.pattern).toBeTruthy();
        expect(rule.id).toBeTruthy();
        expect(rule.enabled).toBe(true);
      });
    });
  });
});
