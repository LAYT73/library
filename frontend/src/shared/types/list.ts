export type ListQueryParams = {
  skip?: number;
  take?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
};

/** Для Select/форм — не больше лимита на бэкенде (@Max(500)) */
export const DROPDOWN_LIST_PARAMS: ListQueryParams = { skip: 0, take: 500 };

export function buildListParams(params: ListQueryParams = {}) {
  const { skip = 0, take = 25, ...rest } = params;
  const out: Record<string, string | number | boolean> = { skip, take };
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== '' && value !== null) {
      out[key] = value;
    }
  }
  return out;
}
