import { beforeEach } from "node:test";

export const ID = {
  _store: [] as string[],
  generate(name: string): string {
    const i = this._store.indexOf(name);
    if (0 <= i) return i.toString();
    return this._store.push(name).toString();
  },
  getNameById(id: string): string {
    return this._store.at(parseInt(id, 10) - 1) ?? "-1";
  },
  reset(): void {
    this._store.length = 0;
  },
};

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("id", () => {
    beforeEach(() => {
      ID.reset();
    });

    it("generate and recovery", () => {
      const [name1, id1] = ["foo", "1"];
      const [name2, id2] = ["bar", "2"];

      expect(ID.generate(name1)).toBe(id1);
      expect(ID.generate(name2)).toBe(id2);
      expect(ID.getNameById(id1)).toBe(name1);
      expect(ID.getNameById(id2)).toBe(name2);
    });
  });
}
