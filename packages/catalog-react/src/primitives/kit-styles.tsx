import React from 'react';
import {hashCss} from '../renderers/hash-css';
import {StyleTag} from '../renderers/style-tag';
import {KIT_BUTTON_CSS} from './button-css';
import {KIT_CARD_CSS} from './card-css';
import {KIT_CHIP_CSS} from './chip-css';
import {KIT_DATA_CHIP_CSS} from './data-chip-css';
import {KIT_FORM_CSS} from './form-css';
import {KIT_POPUP_CSS} from './popup-css';
import {KIT_REPORT_NOTE_CSS} from './report-note-css';
import {KIT_REPORT_PROTOCOL_CSS} from './report-protocol-css';
import {KIT_REPORT_ROW_CSS} from './report-row-css';
import {KIT_REPORT_TABLE_CSS} from './report-table-css';
import {KIT_STATUS_PILL_CSS} from './status-pill-css';
import {KIT_TOKENS_CSS} from './kit-tokens-css';
import {KIT_TYPOGRAPHY_CSS} from './kit-typography-css';

/**
 * Слои набора по порядку: токены первыми — примитивы читают только их.
 * Каждый слой отдельным тегом, чтобы правку одного не тащить через остальные.
 */
const LAYERS: Array<[string, string]> = [
  ['a2ui-kit-tokens', KIT_TOKENS_CSS],
  ['a2ui-kit-typography', KIT_TYPOGRAPHY_CSS],
  ['a2ui-kit-button', KIT_BUTTON_CSS],
  ['a2ui-kit-card', KIT_CARD_CSS],
  ['a2ui-kit-chip', KIT_CHIP_CSS],
  ['a2ui-kit-form', KIT_FORM_CSS],
  ['a2ui-kit-popup', KIT_POPUP_CSS],
  ['a2ui-kit-data-chip', KIT_DATA_CHIP_CSS],
  ['a2ui-kit-status-pill', KIT_STATUS_PILL_CSS],
  ['a2ui-kit-report-row', KIT_REPORT_ROW_CSS],
  ['a2ui-kit-report-table', KIT_REPORT_TABLE_CSS],
  ['a2ui-kit-report-note', KIT_REPORT_NOTE_CSS],
  ['a2ui-kit-report-protocol', KIT_REPORT_PROTOCOL_CSS],
];

/**
 * Стили набора одним узлом: React 19 дедуплицирует `<style href precedence>`,
 * поэтому каждая поверхность объявляет весь набор, а в документ он попадает
 * один раз. Хэш в `href` — чтобы правка CSS доходила при HMR (см. `hash-css`).
 */
export function KitStyles() {
  return (
    <>
      {LAYERS.map(([name, css]) => (
        <StyleTag key={name} href={`${name}-${hashCss(css)}`} css={css} />
      ))}
    </>
  );
}
