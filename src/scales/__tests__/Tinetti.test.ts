import { describe, it, expect } from 'vitest';
import { interpret } from '../Tinetti';

describe('Tinetti — interpret', () => {
  it('clasifica como "Bajo riesgo de caída" para score >= 24', () => {
    expect(interpret(28)).toEqual({ text: 'Bajo riesgo de caída', severity: 'normal' });
    expect(interpret(24)).toEqual({ text: 'Bajo riesgo de caída', severity: 'normal' });
  });

  it('clasifica como "Riesgo moderado de caída" para score 19-23', () => {
    expect(interpret(23)).toEqual({ text: 'Riesgo moderado de caída', severity: 'moderate' });
    expect(interpret(19)).toEqual({ text: 'Riesgo moderado de caída', severity: 'moderate' });
  });

  it('clasifica como "Alto riesgo de caída" para score < 19', () => {
    expect(interpret(18)).toEqual({ text: 'Alto riesgo de caída', severity: 'severe' });
    expect(interpret(0)).toEqual({ text: 'Alto riesgo de caída', severity: 'severe' });
  });

  it('respeta los puntos de corte documentados (Tinetti 1986)', () => {
    expect(interpret(24).severity).toBe('normal');
    expect(interpret(23).severity).toBe('moderate');
    expect(interpret(19).severity).toBe('moderate');
    expect(interpret(18).severity).toBe('severe');
  });
});
