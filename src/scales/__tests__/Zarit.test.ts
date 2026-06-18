import { describe, it, expect } from 'vitest';
import { interpret } from '../Zarit';

describe('Zarit — interpret', () => {
  it('clasifica como "Sin sobrecarga" para score < 22', () => {
    expect(interpret(0)).toEqual({ text: 'Sin sobrecarga', severity: 'normal' });
    expect(interpret(21)).toEqual({ text: 'Sin sobrecarga', severity: 'normal' });
  });

  it('clasifica como "Sobrecarga leve" para score 22-46', () => {
    expect(interpret(22)).toEqual({ text: 'Sobrecarga leve', severity: 'mild' });
    expect(interpret(46)).toEqual({ text: 'Sobrecarga leve', severity: 'mild' });
  });

  it('clasifica como "Sobrecarga intensa" para score >= 47', () => {
    expect(interpret(47)).toEqual({ text: 'Sobrecarga intensa', severity: 'severe' });
    expect(interpret(88)).toEqual({ text: 'Sobrecarga intensa', severity: 'severe' });
  });

  it('respeta los puntos de corte documentados (Zarit 1980)', () => {
    expect(interpret(21).severity).toBe('normal');
    expect(interpret(22).severity).toBe('mild');
    expect(interpret(46).severity).toBe('mild');
    expect(interpret(47).severity).toBe('severe');
  });

  it('no hay gap entre "Sin sobrecarga" y "Sobrecarga leve"', () => {
    // 21 → normal, 22 → mild: límite correcto
    expect(interpret(21).severity).not.toBe(interpret(22).severity);
  });

  it('no hay gap entre "Sobrecarga leve" y "Sobrecarga intensa"', () => {
    expect(interpret(46).severity).not.toBe(interpret(47).severity);
  });
});
