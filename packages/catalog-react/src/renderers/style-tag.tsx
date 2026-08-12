import React from 'react';
import type {StyleTagProps} from './style-tag.types';

/**
 * Стилевой слой пакета без отдельного CSS-файла: React 19 поднимает
 * `<style href precedence>` в `<head>` и дедуплицирует его по `href` — работает
 * и в SSR, и без бандлера в сборке пакета (Решение 1 design.md).
 *
 * `precedence="default"` — самая низкая ступень порядка: правила хоста,
 * объявленные позже, перекрывают наши без `!important`.
 */
export function StyleTag({href, css}: StyleTagProps) {
  return (
    <style href={href} precedence="default">
      {css}
    </style>
  );
}
