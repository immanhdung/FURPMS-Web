/** Newest-first by a sequential numeric id — a reasonable proxy for creation order when no timestamp field exists. */
export function sortByIdDesc<T extends { id: number }>(items: T[] | null | undefined): T[] {
  return [...(items ?? [])].sort((a, b) => b.id - a.id);
}

/** Newest-first by an ISO date/datetime field. */
export function sortByDateDesc<T>(items: T[] | null | undefined, getDate: (item: T) => string | null | undefined): T[] {
  return [...(items ?? [])].sort((a, b) => {
    const timeA = getDate(a) ? new Date(getDate(a) as string).getTime() : 0;
    const timeB = getDate(b) ? new Date(getDate(b) as string).getTime() : 0;
    return timeB - timeA;
  });
}
