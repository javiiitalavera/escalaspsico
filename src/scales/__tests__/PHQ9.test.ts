import { describe, it, expect } from 'vitest';
import { interpret } from '../PHQ9';

describe('PHQ-9 — interpret', () => {
  it('clasifica como "Depresión mínima o ausente" para score 0-4', () => {
    expect(interpret(0)).toEqual({ text: 'Depresión mínima o ausente', severity: 'normal' });
    expect(interpret(4)).toEqual({ text: 'Depresión mínima o ausente', severity: 'normal' });
  });

  it('clasifica como "Depresión leve" para score 5-9', () => {
    expect(interpret(5)).toEqual({ text: 'Depresión leve', severity: 'mild' });
    expect(interpret(9)).toEqual({ text: 'Depresión leve', severity: 'mild' });
  });

  it('clasifica como "Depresión moderada" para score 10-14', () => {
    expect(interpret(10)).toEqual({ text: 'Depresión moderada', severity: 'moderate' });
    expect(interpret(14)).toEqual({ text: 'Depresión moderada', severity: 'moderate' });
  });

  it('clasifica como "Depresión moderadamente grave" para score 15-19', () => {
    expect(interpret(15)).toEqual({ text: 'Depresión moderadamente grave', severity: 'severe' });
    expect(interpret(19)).toEqual({ text: 'Depresión moderadamente grave', severity: 'severe' });
  });

  it('clasifica como "Depresión grave" para score >= 20', () => {
    expect(interpret(20)).toEqual({ text: 'Depresión grave', severity: 'severe' });
    expect(interpret(27)).toEqual({ text: 'Depresión grave', severity: 'severe' });
  });

  it('respeta los puntos de corte documentados (Kroenke & Spitzer 2002)', () => {
    expect(interpret(4).severity).toBe('normal');
    expect(interpret(5).severity).toBe('mild');
    expect(interpret(9).severity).toBe('mild');
    expect(interpret(10).severity).toBe('moderate');
    expect(interpret(14).severity).toBe('moderate');
    expect(interpret(15).severity).toBe('severe');
    expect(interpret(19).severity).toBe('severe');
    expect(interpret(20).severity).toBe('severe');
  });
});
