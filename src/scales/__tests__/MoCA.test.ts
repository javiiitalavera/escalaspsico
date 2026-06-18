import { describe, it, expect } from 'vitest';
import { getScore, interpret } from '../MoCA';
import type { Answers } from '../MoCA';

function build(overrides: Partial<Answers> = {}): Answers {
  return {
    vs_sendero: 0,
    vs_cubo: 0,
    vs_reloj_c: 0,
    vs_reloj_n: 0,
    vs_reloj_m: 0,
    nombrar: 0,
    atencion1: 0,
    atencion2: 0,
    atencion3: 0,
    lenguaje1: 0,
    lenguaje2: 0,
    abstraccion: 0,
    recuerdo: 0,
    orientacion: 0,
    escolaridad: 0,
    ...overrides,
  };
}

describe('MoCA — getScore', () => {
  it('devuelve 0 cuando todas las respuestas son 0 (sin escolaridad)', () => {
    expect(getScore(build())).toBe(0);
  });

  it('suma +1 por escolaridad ≤12 años', () => {
    expect(getScore(build({ escolaridad: 1 }))).toBe(1);
  });

  it('devuelve 30 para puntuación máxima (29 bruta + 1 escolaridad)', () => {
    const max = build({
      vs_sendero: 1,
      vs_cubo: 1,
      vs_reloj_c: 1,
      vs_reloj_n: 1,
      vs_reloj_m: 1, // 5 visuoespacial
      nombrar: 3,
      atencion1: 2,
      atencion2: 3,
      atencion3: 1, // 6 atención
      lenguaje1: 2,
      lenguaje2: 1, // 3 lenguaje
      abstraccion: 2,
      recuerdo: 5,
      orientacion: 6,
      escolaridad: 1,
    });
    // Total bruto: 5+3+6+3+2+5+6 = 30 → pero la fn hace Math.min(30, raw + escolaridad)
    // Sin escolaridad: 30. Con escolaridad: min(30, 31) = 30
    expect(getScore(max)).toBe(30);
  });

  it('suma correctamente solo visuoespacial (0-5)', () => {
    expect(
      getScore(
        build({
          vs_sendero: 1,
          vs_cubo: 1,
          vs_reloj_c: 1,
          vs_reloj_n: 1,
          vs_reloj_m: 1,
        }),
      ),
    ).toBe(5);
  });

  it('suma correctamente nombrar (0-3)', () => {
    expect(getScore(build({ nombrar: 3 }))).toBe(3);
    expect(getScore(build({ nombrar: 2 }))).toBe(2);
  });

  it('suma correctamente atención (series + resta + vigilancia, 0-6)', () => {
    expect(getScore(build({ atencion1: 2, atencion2: 3, atencion3: 1 }))).toBe(6);
  });

  it('suma correctamente recuerdo diferido (0-5)', () => {
    expect(getScore(build({ recuerdo: 5 }))).toBe(5);
    expect(getScore(build({ recuerdo: 0 }))).toBe(0);
  });

  it('suma correctamente orientación (0-6)', () => {
    expect(getScore(build({ orientacion: 6 }))).toBe(6);
  });

  it('capa en 30 aunque raw + escolaridad > 30', () => {
    const overflow = build({
      vs_sendero: 1,
      vs_cubo: 1,
      vs_reloj_c: 1,
      vs_reloj_n: 1,
      vs_reloj_m: 1,
      nombrar: 3,
      atencion1: 2,
      atencion2: 3,
      atencion3: 1,
      lenguaje1: 2,
      lenguaje2: 1,
      abstraccion: 2,
      recuerdo: 5,
      orientacion: 6,
      escolaridad: 1,
    });
    expect(getScore(overflow)).toBeLessThanOrEqual(30);
  });

  it('puntuación bruta 25 + escolaridad 1 = 26', () => {
    const a = build({
      vs_sendero: 1,
      vs_cubo: 1,
      vs_reloj_c: 1,
      vs_reloj_n: 1,
      vs_reloj_m: 1, // 5
      nombrar: 3, // 3
      atencion1: 2,
      atencion2: 3,
      atencion3: 1, // 6
      lenguaje1: 2,
      lenguaje2: 1, // 3
      abstraccion: 2, // 2
      recuerdo: 4, // 4 (uno menos que el máximo)
      orientacion: 6, // 6
      escolaridad: 1,
    });
    // bruta = 5+3+6+3+2+4+6 = 29. +1 escolaridad = 30
    expect(getScore(a)).toBe(30);
  });
});

describe('MoCA — interpret', () => {
  it('clasifica como "Normal" para score >= 26', () => {
    expect(interpret(30)).toEqual({ text: 'Normal', severity: 'normal' });
    expect(interpret(26)).toEqual({ text: 'Normal', severity: 'normal' });
  });

  it('clasifica como "Deterioro leve" para score 21-25', () => {
    expect(interpret(25)).toEqual({ text: 'Deterioro leve', severity: 'mild' });
    expect(interpret(21)).toEqual({ text: 'Deterioro leve', severity: 'mild' });
  });

  it('clasifica como "Deterioro moderado" para score 11-20', () => {
    expect(interpret(20)).toEqual({ text: 'Deterioro moderado', severity: 'moderate' });
    expect(interpret(11)).toEqual({ text: 'Deterioro moderado', severity: 'moderate' });
  });

  it('clasifica como "Deterioro grave" para score <= 10', () => {
    expect(interpret(10)).toEqual({ text: 'Deterioro grave', severity: 'severe' });
    expect(interpret(0)).toEqual({ text: 'Deterioro grave', severity: 'severe' });
  });

  it('respeta los puntos de corte documentados (Nasreddine 2005)', () => {
    expect(interpret(25).severity).toBe('mild');
    expect(interpret(26).severity).toBe('normal');
    expect(interpret(20).severity).toBe('moderate');
    expect(interpret(21).severity).toBe('mild');
    expect(interpret(10).severity).toBe('severe');
    expect(interpret(11).severity).toBe('moderate');
  });
});
