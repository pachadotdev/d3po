import { validateData, calculateBoxStats, groupBy, formatNumber } from '../src/utils';

describe('Utils', () => {
  describe('validateData', () => {
    it('should validate data with required fields', () => {
      const data = [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ];
      expect(() => validateData(data, ['x', 'y'])).not.toThrow();
    });

    it('should throw error for empty array', () => {
      expect(() => validateData([], ['x'])).toThrow('Data must be a non-empty array');
    });

    it('should throw error for missing fields', () => {
      const data = [{ x: 1 }];
      expect(() => validateData(data, ['x', 'y'])).toThrow('Missing required fields: y');
    });
  });

  describe('calculateBoxStats', () => {
    it('should calculate correct statistics', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const stats = calculateBoxStats(values);
      
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(10);
      expect(stats.median).toBe(5.5);
      expect(stats.q1).toBe(3.25);
      expect(stats.q3).toBe(7.75);
    });
  });

  describe('groupBy', () => {
    it('should group data by field', () => {
      const data = [
        { type: 'A', value: 1 },
        { type: 'B', value: 2 },
        { type: 'A', value: 3 },
      ];
      const grouped = groupBy(data, 'type');
      
      expect(grouped.A).toHaveLength(2);
      expect(grouped.B).toHaveLength(1);
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with decimals', () => {
      expect(formatNumber(3.14159, 2)).toBe('3.14');
      expect(formatNumber(10, 0)).toBe('10');
    });

    it('should return non-numbers as-is', () => {
      expect(formatNumber('text', 2)).toBe('text');
    });
  });
});
