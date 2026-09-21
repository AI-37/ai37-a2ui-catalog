import {describe, expect, it} from 'vitest';
import type {ConstructionEntry} from '@ai37/a2ui-catalog-schemas';
import {computeNt} from '../../packages/catalog-react/src/renderers/compute-nt';
import {effectiveRnorm} from '../../packages/catalog-react/src/renderers/effective-rnorm';

/**
 * Числа взяты из приложения К СП 50.13330.2024: tв = 20, tот = −3,1;
 * лестнично-лифтовой узел при 18 °C даёт 0,913, неотапливаемый подвал при
 * 8 °C — 0,519. Так проверяется и формула, и ориентация: у перекрытия над
 * подвалом температура подвала стоит на месте tот*, а не tв*.
 */
const CLIMATE = {tv: 20, tot: -3.1};

const entry = (patch: Partial<ConstructionEntry>): ConstructionEntry => ({
  id: 'c0',
  type: 'steny',
  layers: [],
  ...patch,
});

describe('computeNt (5.3)', () => {
  it('ЛЛУ при tв* 18 — 0,913 (пример К СП 50)', () => {
    expect(computeNt(entry({tvRoom: 18}), CLIMATE)).toBeCloseTo(0.913, 3);
  });

  it('перекрытие над подвалом при tот* +8 — 0,519 (пример К СП 50)', () => {
    expect(computeNt(entry({totRoom: 8}), CLIMATE)).toBeCloseTo(0.519, 3);
  });

  it('обе температуры заданы — считаются обе', () => {
    expect(computeNt(entry({tvRoom: 18, totRoom: 8}), CLIMATE)).toBeCloseTo(10 / 23.1, 6);
  });

  it('ни одной температуры — поправки нет', () => {
    expect(computeNt(entry({}), CLIMATE)).toBeNull();
  });

  it('климат здания неполон — знаменатель неизвестен', () => {
    expect(computeNt(entry({tvRoom: 16}), {tv: null, tot: -3.1})).toBeNull();
    expect(computeNt(entry({tvRoom: 16}), {tv: 20, tot: null})).toBeNull();
  });

  it('негодная пара температур поправки не даёт', () => {
    // tв* ниже холодной стороны: разность отрицательная.
    expect(computeNt(entry({tvRoom: -10}), CLIMATE)).toBeNull();
    // знаменатель ≤ 0: здание не отапливается относительно улицы.
    expect(computeNt(entry({tvRoom: 16}), {tv: -3.1, tot: -3.1})).toBeNull();
  });
});

describe('effectiveRnorm', () => {
  it('без поправки норма не меняется', () => {
    expect(effectiveRnorm(3.19, null)).toBe(3.19);
  });

  it('с поправкой норма умножается', () => {
    expect(effectiveRnorm(3.19, 0.5)).toBeCloseTo(1.595, 6);
  });

  it('нормы у типа нет — сравнивать не с чем', () => {
    expect(effectiveRnorm(undefined, 0.5)).toBeUndefined();
  });
});
