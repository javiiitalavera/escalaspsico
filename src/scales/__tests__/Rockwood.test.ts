import { describe, it, expect } from 'vitest';
import { rockwoodInterpret, ROCKWOOD_LEVELS } from '../Rockwood';

describe('Rockwood CFS — niveles', () => {
  it('tiene 9 niveles (1-9)', () => {
    expect(ROCKWOOD_LEVELS).toHaveLength(9);
    expect(ROCKWOOD_LEVELS.map((l) => l.score)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('cada nivel tiene label, description y severity', () => {
    for (const level of ROCKWOOD_LEVELS) {
      expect(typeof level.label).toBe('string');
      expect(level.label.length).toBeGreaterThan(0);
      expect(typeof level.description).toBe('string');
      expect(level.description.length).toBeGreaterThan(20);
      expect(['normal', 'mild', 'moderate', 'severe']).toContain(level.severity);
    }
  });
});

describe('Rockwood CFS — rockwoodInterpret', () => {
  it('devuelve null para score fuera de rango', () => {
    expect(rockwoodInterpret(0)).toBeNull();
    expect(rockwoodInterpret(10)).toBeNull();
    expect(rockwoodInterpret(-1)).toBeNull();
  });

  it('niveles 1-3 → normal (robusto, en forma, manejando bien)', () => {
    expect(rockwoodInterpret(1)?.severity).toBe('normal');
    expect(rockwoodInterpret(2)?.severity).toBe('normal');
    expect(rockwoodInterpret(3)?.severity).toBe('normal');
  });

  it('niveles 4-5 → mild (vulnerable, levemente frágil)', () => {
    expect(rockwoodInterpret(4)?.severity).toBe('mild');
    expect(rockwoodInterpret(5)?.severity).toBe('mild');
  });

  it('nivel 6 → moderate (moderadamente frágil)', () => {
    expect(rockwoodInterpret(6)?.severity).toBe('moderate');
  });

  it('niveles 7-9 → severe (gravemente frágil, muy gravemente frágil, terminal)', () => {
    expect(rockwoodInterpret(7)?.severity).toBe('severe');
    expect(rockwoodInterpret(8)?.severity).toBe('severe');
    expect(rockwoodInterpret(9)?.severity).toBe('severe');
  });

  it('devuelve el label correcto para cada nivel', () => {
    expect(rockwoodInterpret(1)?.label).toBe('Muy en forma');
    expect(rockwoodInterpret(5)?.label).toBe('Levemente frágil');
    expect(rockwoodInterpret(9)?.label).toBe('Enfermedad terminal');
  });
});
