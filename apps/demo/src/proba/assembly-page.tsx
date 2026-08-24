import React from 'react';
import {CardAssembly} from './card-assembly';
import {ProbaShell} from './proba-shell';

/** `/proba/assembly` — проверка примитивов на настоящем экране. */
export function AssemblyPage() {
  return (
    <ProbaShell
      route="/proba/assembly"
      eyebrow="AI37 A2UI CATALOG"
      title="Сборка"
      lead="Экран конструкций, собранный из готовых примитивов."
    >
      <CardAssembly />
    </ProbaShell>
  );
}
