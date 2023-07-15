import { deepKeys, getProperty } from "dot-prop";

export const flatten = (target: Record<string, any>[]) => {
  const _flatten = (target: Record<string, any>) => {
    const keys = deepKeys(target);
    return Object.fromEntries(
      keys.map((key) => [key, getProperty(target, key)])
    );
  };

  return target.map((t) => _flatten(t));
};

export const keys = (target: Record<string, any>[]) => {
  const keys = Array.from(
    new Set(...flatten(target).map((o) => Object.keys(o)))
  );
  return keys;
};

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  const data = [
    {
      year: 2020,
      countory: {
        japan: {
          a: 1,
          b: 2,
        },
        us: {
          a: 3,
          b: 4,
        },
      },
    },
    {
      year: 2021,
      countory: {
        japan: {
          a: 1,
          b: 2,
        },
        us: {
          a: 3,
          b: 4,
        },
      },
    },
  ];

  describe("flatten", () => {
    it("array", () => {
      expect(flatten(data)).toEqual([
        {
          year: 2020,
          "countory.japan.a": 1,
          "countory.japan.b": 2,
          "countory.us.a": 3,
          "countory.us.b": 4,
        },
        {
          year: 2021,
          "countory.japan.a": 1,
          "countory.japan.b": 2,
          "countory.us.a": 3,
          "countory.us.b": 4,
        },
      ]);
    });
  });

  describe("keys", () => {
    it("array", () => {
      expect(keys(data)).toEqual([
        "year",
        "countory.japan.a",
        "countory.japan.b",
        "countory.us.a",
        "countory.us.b",
      ]);
    });
  });
}
