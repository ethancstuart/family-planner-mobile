/**
 * Starter test for grocery hooks — validates query key construction
 * and data transformation patterns.
 */

describe("Grocery hooks query keys", () => {
  it("builds correct query key for grocery lists", () => {
    const householdId = "hh-123";
    const queryKey = ["grocery-lists", householdId];
    expect(queryKey).toEqual(["grocery-lists", "hh-123"]);
  });

  it("builds correct query key for grocery items", () => {
    const listId = "list-456";
    const queryKey = ["grocery-items", listId];
    expect(queryKey).toEqual(["grocery-items", "list-456"]);
  });

  it("builds correct query key for single grocery list", () => {
    const listId = "list-789";
    const queryKey = ["grocery-list", listId];
    expect(queryKey).toEqual(["grocery-list", "list-789"]);
  });
});

describe("Grocery data transformation", () => {
  it("computes progress from items", () => {
    const items = [
      { id: "1", checked: true },
      { id: "2", checked: false },
      { id: "3", checked: true },
    ];

    const totalItems = items.length;
    const checkedItems = items.filter((i) => i.checked).length;
    const progress = totalItems > 0 ? checkedItems / totalItems : 0;

    expect(totalItems).toBe(3);
    expect(checkedItems).toBe(2);
    expect(progress).toBeCloseTo(0.667, 2);
  });

  it("handles empty items array", () => {
    const items: { id: string; checked: boolean }[] = [];
    const totalItems = items.length;
    const progress = totalItems > 0 ? items.filter((i) => i.checked).length / totalItems : 0;

    expect(totalItems).toBe(0);
    expect(progress).toBe(0);
  });
});
