/** Оставляет в ISBN только цифры, X и дефисы. */
export function maskIsbn(value: string): string {
  return value.replace(/[^\dXx\-]/g, '').slice(0, 17);
}

/** ФИО: буквы (латиница/кириллица), пробелы, дефис, апостроф, точка. */
export function maskPersonName(value: string): string {
  return value.replace(/[^\p{L}\s.\-']/gu, '').replace(/\s{2,}/g, ' ');
}

/** Название группы: буквы, цифры, дефис, подчёркивание. */
export function maskGroupName(value: string): string {
  return value.replace(/[^\p{L}\d\-_]/gu, '').slice(0, 40);
}

/** Только цифры (инвентарный номер и т.п.). */
export function maskDigitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Денежная сумма: цифры и одна точка/запятая. */
export function maskMoneyInput(value: string): string {
  const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
  const parts = cleaned.split('.');
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join('')}`;
}
