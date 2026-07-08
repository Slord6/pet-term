import { createHash } from "node:crypto";

export function shortHash(input: string): string {
  return createHash("sha1").update(input).digest("hex").slice(0, 12);
}
