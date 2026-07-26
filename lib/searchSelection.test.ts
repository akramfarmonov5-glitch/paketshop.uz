import { describe, expect, it } from 'vitest';
import { moveSearchSelection } from './searchSelection';

describe('moveSearchSelection', () => {
  it('selects the first or last result from an empty selection', () => {
    expect(moveSearchSelection(-1, 3, 1)).toBe(0);
    expect(moveSearchSelection(-1, 3, -1)).toBe(2);
  });

  it('wraps in both directions', () => {
    expect(moveSearchSelection(2, 3, 1)).toBe(0);
    expect(moveSearchSelection(0, 3, -1)).toBe(2);
  });

  it('returns no selection when there are no results', () => {
    expect(moveSearchSelection(0, 0, 1)).toBe(-1);
  });
});
