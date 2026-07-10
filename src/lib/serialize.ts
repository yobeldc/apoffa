// src/lib/serialize.ts
// JSON serialization helpers for Prisma/bigint

export function serialize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, replacer));
}

function replacer(_key: string, value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  return value;
}

export function deserialize<T>(json: string): T {
  return JSON.parse(json, reviver);
}

function reviver(_key: string, value: unknown): unknown {
  // Could add date parsing here if needed
  return value;
}
