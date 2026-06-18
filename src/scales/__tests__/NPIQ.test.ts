import { describe, it, expect } from 'vitest';
import { interpret } from '../NPIQ';

describe('NPI-Q — interpret', () => {
  it('clasifica como "Carga mínima" para score 0-3', () => {
    expect(interpret(0)).toEqual({ text: 'Carga mínima', severity: 'normal' });
    expect(interpret(3)).toEqual({ text: 'Carga mínima', severity: 'normal' });
  });

  it('clasifica como "Carga leve" para score 4-12', () => {
    expect(interpret(4)).toEqual({ text: 'Carga leve', severity: 'mild' });
    expect(interpret(12)).toEqual({ text: 'Carga leve', severity: 'mild' });
  });

  it('clasifica como "Carga moderada" para score 13-24', () => {
    expect(interpret(13)).toEqual({ text: 'Carga moderada', severity: 'moderate' });
    expect(interpret(24)).toEqual({ text: 'Carga moderada', severity: 'moderate' });
  });

  it('clasifica como "Carga alta" para score > 24', () => {
    expect(interpret(25)).toEqual({ text: 'Carga alta', severity: 'severe' });
    expect(interpret(36)).toEqual({ text: 'Carga alta', severity: 'severe' });
  });

  it('respeta los puntos de corte documentados (Kaufer 2000)', () => {
    expect(interpret(3).severity).toBe('normal');
    expect(interpret(4).severity).toBe('mild');
    expect(interpret(12).severity).toBe('mild');
    expect(interpret(13).severity).toBe('moderate');
    expect(interpret(24).severity).toBe('moderate');
    expect(interpret(25).severity).toBe('severe');
  });
});
