import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/server/password";

describe("password hashing", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("correct horse battery stapler", hash)).toBe(false);
  });

  it("salts every hash, so the same password never hashes the same", async () => {
    const [a, b] = await Promise.all([hashPassword("same"), hashPassword("same")]);
    expect(a).not.toBe(b);
    expect(a).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  });

  it("rejects malformed stored hashes instead of throwing", async () => {
    for (const bad of ["", "plain-text", "bcrypt$abc$def", "scrypt$$"]) {
      expect(await verifyPassword("anything", bad)).toBe(false);
    }
  });
});
