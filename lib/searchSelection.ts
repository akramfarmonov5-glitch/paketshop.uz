export type SearchSelectionDirection = -1 | 1;

export function moveSearchSelection(
  currentIndex: number,
  resultCount: number,
  direction: SearchSelectionDirection,
): number {
  if (resultCount <= 0) return -1;
  if (currentIndex < 0) return direction === 1 ? 0 : resultCount - 1;
  return (currentIndex + direction + resultCount) % resultCount;
}
