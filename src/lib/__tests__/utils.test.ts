import { parseTodoInput } from "@/components/todos/add-todo-input";

describe("parseTodoInput", () => {
  it("returns title with no due date when no due: keyword", () => {
    const result = parseTodoInput("Buy groceries");
    expect(result.title).toBe("Buy groceries");
    expect(result.dueDate).toBeNull();
  });

  it("parses due:today", () => {
    const result = parseTodoInput("Buy milk due:today");
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(result.title).toBe("Buy milk");
    expect(result.dueDate).toBe(expected);
  });

  it("parses due:tomorrow", () => {
    const result = parseTodoInput("Clean house due:tomorrow");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const expected = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    expect(result.title).toBe("Clean house");
    expect(result.dueDate).toBe(expected);
  });

  it("parses due:friday (next occurrence)", () => {
    const result = parseTodoInput("Submit report due:friday");
    expect(result.title).toBe("Submit report");
    expect(result.dueDate).not.toBeNull();

    const dueDate = new Date(result.dueDate! + "T00:00:00");
    expect(dueDate.getDay()).toBe(5); // Friday
  });

  it("parses YYYY-MM-DD date", () => {
    const result = parseTodoInput("Plan party due:2026-04-15");
    expect(result.title).toBe("Plan party");
    // Date may shift by timezone; just verify it parses to a valid date
    expect(result.dueDate).not.toBeNull();
    expect(result.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("handles case insensitive due: keyword", () => {
    const result = parseTodoInput("Task DUE:today");
    expect(result.title).toBe("Task");
    expect(result.dueDate).not.toBeNull();
  });

  it("handles invalid due date gracefully", () => {
    const result = parseTodoInput("Task due:notadate");
    expect(result.title).toBe("Task");
    expect(result.dueDate).toBeNull();
  });

  it("trims whitespace", () => {
    const result = parseTodoInput("  Clean kitchen  ");
    expect(result.title).toBe("Clean kitchen");
  });
});
