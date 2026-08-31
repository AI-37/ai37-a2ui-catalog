import React from 'react';

/** Звёздочка обязательного поля: только вид — доступное имя её не читает. */
export function KeoRequiredMark({required}: {required: boolean | undefined}) {
  if (required !== true) {
    return null;
  }

  return <span aria-hidden="true"> *</span>;
}
