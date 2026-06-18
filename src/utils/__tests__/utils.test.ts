import { describe, it, expect, beforeEach } from 'vitest';
import {
  addRecent,
  getSeverityColor,
  getSeverityDot,
  loadFavorites,
  loadRecents,
  saveFavorites,
  saveRecents,
  formatDate,
  cn,
} from '../index';
import type { ScaleResult } from '../../types';

const SAMPLE_RESULT: ScaleResult = {
  scaleId: 'mmse',
  scaleName: 'MMSE',
  score: 28,
  maxScore: 30,
  interpretation: 'Normal',
  severity: 'normal',
  reportText: '...',
  timestamp: 1700000000000,
  answers: { anyo: 1 },
};

describe('utils — localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadFavorites / saveFavorites', () => {
    it('devuelve [] cuando no hay datos', () => {
      expect(loadFavorites()).toEqual([]);
    });

    it('guarda y carga favoritos correctamente', () => {
      saveFavorites(['mmse', 'moca']);
      expect(loadFavorites()).toEqual(['mmse', 'moca']);
    });

    it('no lanza cuando localStorage falla (cuota)', () => {
      const original = localStorage.setItem;
      localStorage.setItem = () => {
        throw new DOMException('QuotaExceededError');
      };
      // No debe lanzar
      saveFavorites(['mmse']);
      localStorage.setItem = original;
    });
  });

  describe('loadRecents / saveRecents', () => {
    it('devuelve [] cuando no hay datos', () => {
      expect(loadRecents()).toEqual([]);
    });

    it('guarda y carga recientes correctamente', () => {
      saveRecents([SAMPLE_RESULT]);
      expect(loadRecents()).toEqual([SAMPLE_RESULT]);
    });

    it('mantiene solo los últimos 10 resultados', () => {
      const many = Array.from({ length: 15 }, (_, i) => ({
        ...SAMPLE_RESULT,
        timestamp: 1700000000000 + i,
      }));
      saveRecents(many);
      expect(loadRecents()).toHaveLength(10);
    });

    it('no lanza cuando localStorage falla (cuota)', () => {
      const original = localStorage.setItem;
      localStorage.setItem = () => {
        throw new DOMException('QuotaExceededError');
      };
      saveRecents([SAMPLE_RESULT]);
      localStorage.setItem = original;
    });
  });

  describe('addRecent', () => {
    it('añade un nuevo resultado al principio', () => {
      const result = addRecent(SAMPLE_RESULT, []);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(SAMPLE_RESULT);
    });

    it('mantiene máximo 10 resultados', () => {
      const existing = Array.from({ length: 10 }, (_, i) => ({
        ...SAMPLE_RESULT,
        score: 20 + i, // score distinto para que la dedupe no los considere iguales
        timestamp: 1700000000000 + i,
      }));
      const result = addRecent({ ...SAMPLE_RESULT, timestamp: 1800000000000 }, existing);
      expect(result).toHaveLength(10);
      expect(result[0].timestamp).toBe(1800000000000);
    });

    it('deduplica resultados idénticos (mismo scaleId+score+interpretation)', () => {
      const existing = [{ ...SAMPLE_RESULT, timestamp: 1700000000000 }];
      const result = addRecent({ ...SAMPLE_RESULT, timestamp: 1800000000000 }, existing);
      // Debe quedar solo 1: el nuevo reemplaza al viejo (dedupe real)
      expect(result).toHaveLength(1);
      expect(result[0].timestamp).toBe(1800000000000);
    });
  });
});

describe('utils — severity helpers', () => {
  it('getSeverityColor devuelve clases para cada severidad', () => {
    expect(getSeverityColor('normal')).toContain('emerald');
    expect(getSeverityColor('mild')).toContain('amber');
    expect(getSeverityColor('moderate')).toContain('orange');
    expect(getSeverityColor('severe')).toContain('red');
    expect(getSeverityColor('info')).toContain('clinical');
  });

  it('getSeverityColor tiene fallback', () => {
    expect(getSeverityColor('unknown' as never)).toContain('slate');
  });

  it('getSeverityDot devuelve bg color para cada severidad', () => {
    expect(getSeverityDot('normal')).toBe('bg-emerald-500');
    expect(getSeverityDot('mild')).toBe('bg-amber-500');
    expect(getSeverityDot('moderate')).toBe('bg-orange-500');
    expect(getSeverityDot('severe')).toBe('bg-red-500');
    expect(getSeverityDot('info')).toBe('bg-clinical-500');
  });
});

describe('utils — formatDate', () => {
  it('formatea un timestamp correctamente', () => {
    const ts = new Date('2023-03-14T10:30:00Z').getTime();
    const formatted = formatDate(ts);
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{2}/);
    expect(formatted).toMatch(/\d{2}:\d{2}/);
  });
});

describe('utils — cn (className merge)', () => {
  it('combina clases simples', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('respeta condicionales falsy', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('mergea clases Tailwind conflictivas (última gana)', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});
