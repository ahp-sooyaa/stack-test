export type SearchParams = Record<string, string | string[] | undefined>;

export function getSearchParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0] ?? undefined;
  }

  return value;
}
