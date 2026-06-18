import { describe, it, expect } from 'vitest';
import { interpret } from '../FRAIL';

describe('FRAIL Scale — interpret', () => {
  it('clasifica como "Robusto" para score = 0', () => {
    expect(interpret(0)).toEqual({ text: 'Robusto', severity: 'normal' });
  });

  it('clasifica como "Pre-frágil" para score 1-2', () => {
    expect(interpret(1)).toEqual({ text: 'Pre-frágil', severity: 'mild' });
    expect(interpret(2)).toEqual({ text: 'Pre-frágil', severity: 'mild' });
  });

  it('clasifica como "Frágil" para score >= 3', () => {
    expect(interpret(3)).toEqual({ text: 'Frágil', severity: 'severe' });
    expect(interpret(5)).toEqual({ text: 'Frágil', severity: 'severe' });
  });

  it('respeta los puntos de corte documentados (Morley 2012)', () => {
    expect(interpret(0).severity).toBe('normal');
    expect(interpret(1).severity).toBe('mild');
    expect(interpret(2).severity).toBe('mild');
    expect(interpret(3).severity).toBe('severe');
    expect(interpret(5).severity).toBe('severe');
  });

  it('no clasifica score 1-2 como frágil (limmite pre-frágil)', () => {
    expect(interpret(2).severity).not.toBe('severe');
    expect(interpret(3).severity).toBe('severe');
  });
});
