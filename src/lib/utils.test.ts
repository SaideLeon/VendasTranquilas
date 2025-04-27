import { cn } from "./utils";

describe("cn", () => {
  it("should return two classNames together", () => {
    const result = cn("class1", "class2");
    expect(result).toBe("class1 class2");
  });
});