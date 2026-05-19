import type { Rule } from 'antd/es/form';

const CURRENT_YEAR = new Date().getFullYear();

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const PERSON_NAME_RE = /^[\p{L}][\p{L}\s.\-']{1,}$/u;

const ISBN_RE = /^[\d\-Xx]{10,17}$/;

function digitsOnly(s: string): string {
  return s.replace(/[^\dXx]/gi, '').toUpperCase();
}

function isValidIsbn(raw: string): boolean {
  const d = digitsOnly(raw);
  return d.length === 10 || d.length === 13;
}

export const rules = {
  required: (message = 'Обязательное поле'): Rule => ({
    required: true,
    whitespace: true,
    message,
  }),

  selectRequired: (message = 'Выберите значение'): Rule[] => [
    { required: true, message },
  ],

  email: (): Rule[] => [
    rules.required('Укажите email'),
    { type: 'email' as const, message: 'Некорректный email' },
    {
      validator: (_: unknown, value: string) => {
        if (!value || EMAIL_RE.test(value.trim())) return Promise.resolve();
        return Promise.reject(new Error('Некорректный email'));
      },
    },
  ],

  password: (min = 6): Rule[] => [
    rules.required('Укажите пароль'),
    { min, message: `Пароль должен содержать минимум ${min} символов` },
    {
      validator: (_: unknown, value: string) => {
        if (!value || !/\s/.test(value)) return Promise.resolve();
        return Promise.reject(new Error('Пароль не должен содержать пробелы'));
      },
    },
  ],

  personName: (max = 150): Rule[] => [
    rules.required('Укажите ФИО'),
    { min: 2, message: 'Минимум 2 символа' },
    { max, message: `Не более ${max} символов` },
    {
      pattern: PERSON_NAME_RE,
      message: 'Только буквы, пробелы, дефис и апостроф',
    },
  ],

  text: (opts: { max: number; min?: number; label?: string }): Rule[] => {
    const { max, min = 1, label = 'Поле' } = opts;
    const result: Rule[] = [
      rules.required(`Укажите ${label.toLowerCase()}`),
      { max, message: `Не более ${max} символов` },
    ];
    if (min > 1) {
      result.splice(1, 0, { min, message: `Минимум ${min} символов` });
    }
    return result;
  },

  isbn: (): Rule[] => [
    rules.required('Укажите ISBN'),
    { max: 17, message: 'ISBN не длиннее 17 символов' },
    { pattern: ISBN_RE, message: 'Допустимы цифры, дефисы и X' },
    {
      validator: (_: unknown, value: string) => {
        if (!value || isValidIsbn(value)) return Promise.resolve();
        return Promise.reject(
          new Error('ISBN должен содержать 10 или 13 значащих символов (цифры/X)'),
        );
      },
    },
  ],

  bookTitle: (): Rule[] => rules.text({ max: 200, min: 2, label: 'название' }),

  publisher: (): Rule[] => rules.text({ max: 300, min: 2, label: 'издателя' }),

  year: (): Rule[] => [
    rules.required('Укажите год издания'),
    { type: 'number' as const, message: 'Введите год числом' },
    {
      type: 'number' as const,
      min: 1000,
      max: CURRENT_YEAR + 1,
      message: `Год от 1000 до ${CURRENT_YEAR + 1}`,
    },
  ],

  positiveInt: (label = 'Количество', min = 1): Rule[] => [
    rules.required(`Укажите ${label.toLowerCase()}`),
    { type: 'number' as const, min, message: `Минимум ${min}` },
    {
      validator: (_: unknown, value: number) => {
        if (value == null || Number.isInteger(value)) return Promise.resolve();
        return Promise.reject(new Error('Введите целое число'));
      },
    },
  ],

  nonNegativeMoney: (required = true): Rule[] => {
    const base: Rule[] = [
      { type: 'number' as const, min: 0, message: 'Сумма не может быть отрицательной' },
    ];
    if (required) {
      return [rules.required('Укажите стоимость'), ...base];
    }
    return base;
  },

  inventoryNumber: (): Rule[] => [
    rules.required('Укажите инвентарный номер'),
    { type: 'number' as const, min: 1, message: 'Номер должен быть не меньше 1' },
    {
      validator: (_: unknown, value: number) => {
        if (value == null || Number.isInteger(value)) return Promise.resolve();
        return Promise.reject(new Error('Введите целое число'));
      },
    },
  ],

  reason: (max = 300): Rule[] => [
    rules.required('Укажите причину'),
    { min: 5, message: 'Минимум 5 символов' },
    { max, message: `Не более ${max} символов` },
  ],

  donorName: (): Rule[] => [
    rules.required('Укажите имя донора'),
    { min: 2, message: 'Минимум 2 символа' },
    { max: 200, message: 'Не более 200 символов' },
    {
      pattern: PERSON_NAME_RE,
      message: 'Только буквы, пробелы, дефис и апостроф',
    },
  ],

  disciplineName: (): Rule[] => rules.text({ max: 200, min: 2, label: 'название' }),

  department: (): Rule[] => rules.text({ max: 300, min: 2, label: 'кафедру' }),

  groupName: (): Rule[] => [
    rules.required('Укажите название группы'),
    { min: 2, message: 'Минимум 2 символа' },
    { max: 40, message: 'Не более 40 символов' },
    {
      pattern: /^[\p{L}\d][\p{L}\d\-_]*$/u,
      message: 'Буквы, цифры, дефис и подчёркивание',
    },
  ],

  studentCount: (): Rule[] => [
    rules.required('Укажите число студентов'),
    { type: 'number' as const, min: 0, message: 'Не может быть отрицательным' },
    {
      validator: (_: unknown, value: number) => {
        if (value == null || Number.isInteger(value)) return Promise.resolve();
        return Promise.reject(new Error('Введите целое число'));
      },
    },
  ],

  knowledgeAreaName: (): Rule[] => rules.text({ max: 100, min: 2, label: 'название' }),

  supplierName: (): Rule[] => rules.text({ max: 180, min: 2, label: 'название' }),

  supplierContact: (): Rule[] => rules.text({ max: 400, min: 2, label: 'контактную информацию' }),

  csvRequired: (): Rule[] => [{ required: true, whitespace: true, message: 'Вставьте CSV' }],
};
