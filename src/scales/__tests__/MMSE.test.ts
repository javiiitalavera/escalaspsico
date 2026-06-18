import { describe, it, expect } from 'vitest';
import { getScore, interpret } from '../MMSE';
import type { MMSEAnswers } from '../MMSE';

// Constructor helper: recibe un partial y rellena con ceros
function build(overrides: Partial<MMSEAnswers> = {}): MMSEAnswers {
  return {
    anyo: 0,
    mes: 0,
    dia: 0,
    diaSemana: 0,
    estacion: 0,
    pais: 0,
    comunidad: 0,
    ciudad: 0,
    lugar: 0,
    planta: 0,
    fijacion: 0,
    atencion: 0,
    recuerdo: 0,
    nombrar: 0,
    repetir: 0,
    comprender3: 0,
    leer: 0,
    escribir: 0,
    copiar: 0,
    ...overrides,
  };
}

describe('MMSE — getScore', () => {
  it('devuelve 0 cuando todas las respuestas son 0', () => {
    expect(getScore(build())).toBe(0);
  });

  it('devuelve 30 cuando todas las respuestas son máximas', () => {
    const max = build({
      anyo: 1,
      mes: 1,
      dia: 1,
      diaSemana: 1,
      estacion: 1,
      pais: 1,
      comunidad: 1,
      ciudad: 1,
      lugar: 1,
      planta: 1,
      fijacion: 3,
      atencion: 5,
      recuerdo: 3,
      nombrar: 2,
      repetir: 1,
      comprender3: 3,
      leer: 1,
      escribir: 1,
      copiar: 1,
    });
    // Suma: 5 (orientación temporal) + 5 (espacial) + 3 (fijación) + 5 (atención) + 3 (recuerdo)
    //       + 2+1+3+1+1+1 = 9 (lenguaje y praxias) = 30
    expect(getScore(max)).toBe(30);
  });

  it('suma correctamente solo orientación temporal', () => {
    expect(getScore(build({ anyo: 1, mes: 1, dia: 1, diaSemana: 1, estacion: 1 }))).toBe(5);
  });

  it('suma correctamente solo orientación espacial', () => {
    expect(getScore(build({ pais: 1, comunidad: 1, ciudad: 1, lugar: 1, planta: 1 }))).toBe(5);
  });

  it('suma correctamente fijación (0-3)', () => {
    expect(getScore(build({ fijacion: 3 }))).toBe(3);
    expect(getScore(build({ fijacion: 2 }))).toBe(2);
    expect(getScore(build({ fijacion: 1 }))).toBe(1);
  });

  it('suma correctamente atención y cálculo (0-5)', () => {
    expect(getScore(build({ atencion: 5 }))).toBe(5);
    expect(getScore(build({ atencion: 3 }))).toBe(3);
  });

  it('suma correctamente recuerdo diferido (0-3)', () => {
    expect(getScore(build({ recuerdo: 3 }))).toBe(3);
    expect(getScore(build({ recuerdo: 0 }))).toBe(0);
  });

  it('suma correctamente lenguaje y praxias (0-9)', () => {
    expect(
      getScore(
        build({
          nombrar: 2,
          repetir: 1,
          comprender3: 3,
          leer: 1,
          escribir: 1,
          copiar: 1,
        }),
      ),
    ).toBe(9);
  });

  it('combina varias secciones correctamente', () => {
    // 4 orientación temporal + 3 orientación espacial + 2 fijación + 4 atención + 2 recuerdo + 5 lenguaje
    const a = build({
      anyo: 1,
      mes: 1,
      dia: 1,
      diaSemana: 1, // 4
      pais: 1,
      comunidad: 1,
      lugar: 1, // 3
      fijacion: 2, // 2
      atencion: 4, // 4
      recuerdo: 2, // 2
      nombrar: 2,
      repetir: 1,
      leer: 1,
      escribir: 1, // 5
    });
    expect(getScore(a)).toBe(4 + 3 + 2 + 4 + 2 + 5);
  });
});

describe('MMSE — interpret', () => {
  it('clasifica como "Normal" para score >= 25', () => {
    expect(interpret(30)).toEqual({ text: 'Normal', severity: 'normal' });
    expect(interpret(25)).toEqual({ text: 'Normal', severity: 'normal' });
  });

  it('clasifica como "Deterioro leve" para score 20-24', () => {
    expect(interpret(24)).toEqual({ text: 'Deterioro leve', severity: 'mild' });
    expect(interpret(20)).toEqual({ text: 'Deterioro leve', severity: 'mild' });
  });

  it('clasifica como "Deterioro moderado" para score 10-19', () => {
    expect(interpret(19)).toEqual({ text: 'Deterioro moderado', severity: 'moderate' });
    expect(interpret(10)).toEqual({ text: 'Deterioro moderado', severity: 'moderate' });
  });

  it('clasifica como "Deterioro grave" para score < 10', () => {
    expect(interpret(9)).toEqual({ text: 'Deterioro grave', severity: 'severe' });
    expect(interpret(0)).toEqual({ text: 'Deterioro grave', severity: 'severe' });
  });

  it('respeta los puntos de corte documentados (Folstein 1975)', () => {
    // Límites exactos
    expect(interpret(24).severity).toBe('mild');
    expect(interpret(25).severity).toBe('normal');
    expect(interpret(19).severity).toBe('moderate');
    expect(interpret(20).severity).toBe('mild');
    expect(interpret(9).severity).toBe('severe');
    expect(interpret(10).severity).toBe('moderate');
  });
});
