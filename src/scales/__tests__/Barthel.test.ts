import { describe, it, expect } from 'vitest';
import { interpret } from '../Barthel';
import { interpret as interpretBasico } from '../BarthelBasico';

// Ambos Barthel comparten el mismo contrato de interpretación (puntos de corte idénticos)
describe('Barthel (Shah) — interpret', () => {
  it('clasifica como "Independiente" para score = 100', () => {
    expect(interpret(100)).toEqual({ text: 'Independiente', severity: 'normal' });
  });

  it('clasifica como "Dependencia leve" para score 91-99', () => {
    expect(interpret(99)).toEqual({ text: 'Dependencia leve', severity: 'mild' });
    expect(interpret(91)).toEqual({ text: 'Dependencia leve', severity: 'mild' });
  });

  it('clasifica como "Dependencia moderada" para score 61-90', () => {
    expect(interpret(90)).toEqual({ text: 'Dependencia moderada', severity: 'moderate' });
    expect(interpret(61)).toEqual({ text: 'Dependencia moderada', severity: 'moderate' });
  });

  it('clasifica como "Dependencia grave" para score 21-60', () => {
    expect(interpret(60)).toEqual({ text: 'Dependencia grave', severity: 'severe' });
    expect(interpret(21)).toEqual({ text: 'Dependencia grave', severity: 'severe' });
  });

  it('clasifica como "Dependencia total" para score 0-20', () => {
    expect(interpret(20)).toEqual({ text: 'Dependencia total', severity: 'severe' });
    expect(interpret(0)).toEqual({ text: 'Dependencia total', severity: 'severe' });
  });

  it('respeta los puntos de corte documentados (Shah 1989)', () => {
    expect(interpret(100).severity).toBe('normal');
    expect(interpret(91).severity).toBe('mild');
    expect(interpret(90).severity).toBe('moderate');
    expect(interpret(61).severity).toBe('moderate');
    expect(interpret(60).severity).toBe('severe');
    expect(interpret(21).severity).toBe('severe');
    expect(interpret(20).severity).toBe('severe');
  });
});

describe('Barthel básico — interpret (mismos puntos de corte)', () => {
  it('tiene el mismo contrato que Barthel-Shah', () => {
    for (const score of [0, 20, 21, 60, 61, 90, 91, 99, 100]) {
      expect(interpretBasico(score)).toEqual(interpret(score));
    }
  });
});
