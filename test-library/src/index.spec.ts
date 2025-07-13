import {add} from "."
  
describe("index", () => {
  it("does add work?", () => {
    const result = add(2, 2);
    expect(result).toBe(4);
  });
});
  