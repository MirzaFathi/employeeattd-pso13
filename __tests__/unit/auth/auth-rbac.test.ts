/**
 * ───────────────────────────────────────────────────────────
 * Auth & RBAC – Unit Tests
 * ───────────────────────────────────────────────────────────
 *
 * Tests for JWT token generation, verification, password
 * hashing, and role-based access control logic defined in
 * lib/auth.ts and lib/middleware-helpers.ts.
 *
 * These tests set JWT_SECRET via process.env so they can run
 * in CI without a .env file.
 */

// Set up env BEFORE importing auth (it reads JWT_SECRET at module load)
process.env.JWT_SECRET = "test-secret-key-for-ci-pipeline-only";
process.env.JWT_EXPIRES_IN = "1h";

import jwt from "jsonwebtoken";
import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
} from "@/lib/auth";
import type { JWTPayload } from "@/types";

// ── Test Suites ────────────────────────────────────────────

describe("Auth & RBAC", () => {
  // ────────────────────────────────────────────
  // 1. JWT Token Generation
  // ────────────────────────────────────────────
  describe("generateToken", () => {
    it("should return a non-empty string token", () => {
      const token = generateToken("user123", "admin@attendease.com", "admin");
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should embed correct payload fields", () => {
      const token = generateToken("user456", "emp@attendease.com", "employee");
      const decoded = jwt.decode(token) as JWTPayload & { exp: number; iat: number };

      expect(decoded.userId).toBe("user456");
      expect(decoded.email).toBe("emp@attendease.com");
      expect(decoded.role).toBe("employee");
    });

    it("should include an expiration claim", () => {
      const token = generateToken("user789", "test@attendease.com", "admin");
      const decoded = jwt.decode(token) as JWTPayload & { exp: number; iat: number };

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it("should generate unique tokens for different users", () => {
      const token1 = generateToken("user-a", "a@attendease.com", "admin");
      const token2 = generateToken("user-b", "b@attendease.com", "employee");

      expect(token1).not.toBe(token2);
    });
  });

  // ────────────────────────────────────────────
  // 2. JWT Token Verification
  // ────────────────────────────────────────────
  describe("verifyToken", () => {
    it("should return payload for a valid token", () => {
      const token = generateToken("user123", "admin@attendease.com", "admin");
      const payload = verifyToken(token);

      expect(payload).not.toBeNull();
      expect(payload!.userId).toBe("user123");
      expect(payload!.email).toBe("admin@attendease.com");
      expect(payload!.role).toBe("admin");
    });

    it("should return null for a tampered token", () => {
      const token = generateToken("user123", "admin@attendease.com", "admin");
      const tamperedToken = token.slice(0, -5) + "XXXXX";

      const payload = verifyToken(tamperedToken);
      expect(payload).toBeNull();
    });

    it("should return null for a completely invalid string", () => {
      const payload = verifyToken("not.a.valid.jwt.token");
      expect(payload).toBeNull();
    });

    it("should return null for an empty string", () => {
      const payload = verifyToken("");
      expect(payload).toBeNull();
    });

    it("should return null for an expired token", () => {
      // Manually sign a token that expired 1 hour ago
      const expiredToken = jwt.sign(
        { userId: "user-exp", email: "exp@attendease.com", role: "employee" },
        process.env.JWT_SECRET!,
        { expiresIn: "-1h" }
      );

      const payload = verifyToken(expiredToken);
      expect(payload).toBeNull();
    });

    it("should return null for token signed with a different secret", () => {
      const wrongSecretToken = jwt.sign(
        { userId: "hacker", email: "hacker@evil.com", role: "admin" },
        "wrong-secret-key"
      );

      const payload = verifyToken(wrongSecretToken);
      expect(payload).toBeNull();
    });
  });

  // ────────────────────────────────────────────
  // 3. RBAC – Role Integrity in Tokens
  // ────────────────────────────────────────────
  describe("Role-Based Access Control", () => {
    it("should preserve 'admin' role through generate → verify cycle", () => {
      const token = generateToken("admin-id", "admin@attendease.com", "admin");
      const payload = verifyToken(token);

      expect(payload).not.toBeNull();
      expect(payload!.role).toBe("admin");
      expect(payload!.role).not.toBe("employee");
    });

    it("should preserve 'employee' role through generate → verify cycle", () => {
      const token = generateToken("emp-id", "emp@attendease.com", "employee");
      const payload = verifyToken(token);

      expect(payload).not.toBeNull();
      expect(payload!.role).toBe("employee");
      expect(payload!.role).not.toBe("admin");
    });

    it("should NOT allow an employee token to pass admin check", () => {
      const token = generateToken("emp-id", "emp@attendease.com", "employee");
      const payload = verifyToken(token);

      // Simulate the requireAdmin guard from middleware-helpers.ts
      const isAdmin = payload?.role === "admin";
      expect(isAdmin).toBe(false);
    });

    it("should allow an admin token to pass admin check", () => {
      const token = generateToken("admin-id", "admin@attendease.com", "admin");
      const payload = verifyToken(token);

      const isAdmin = payload?.role === "admin";
      expect(isAdmin).toBe(true);
    });

    it("should prevent role escalation via token tampering", () => {
      // Generate an employee token
      const token = generateToken("emp-id", "emp@attendease.com", "employee");

      // Attempt to manually change payload (decode → modify → re-encode)
      // Without the secret key, the signature will be invalid
      const parts = token.split(".");
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
      payload.role = "admin"; // escalation attempt
      parts[1] = Buffer.from(JSON.stringify(payload)).toString("base64url");
      const tamperedToken = parts.join(".");

      const verifiedPayload = verifyToken(tamperedToken);
      // Should be null because signature is now invalid
      expect(verifiedPayload).toBeNull();
    });

    it("should reject forged admin token from external source", () => {
      // An attacker forges a token with a guessed secret
      const forgedToken = jwt.sign(
        { userId: "attacker", email: "attacker@evil.com", role: "admin" },
        "guessed-wrong-secret"
      );

      const payload = verifyToken(forgedToken);
      expect(payload).toBeNull();
    });
  });

  // ────────────────────────────────────────────
  // 4. Password Hashing
  // ────────────────────────────────────────────
  describe("Password Hashing", () => {
    it("should hash a password to a different string", async () => {
      const plain = "SecureP@ss123!";
      const hashed = await hashPassword(plain);

      expect(hashed).not.toBe(plain);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it("should verify a correct password against its hash", async () => {
      const plain = "MyPassword456!";
      const hashed = await hashPassword(plain);

      const isMatch = await comparePassword(plain, hashed);
      expect(isMatch).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const hashed = await hashPassword("CorrectPassword");

      const isMatch = await comparePassword("WrongPassword", hashed);
      expect(isMatch).toBe(false);
    });

    it("should generate different hashes for the same password (salt)", async () => {
      const plain = "SamePassword";
      const hash1 = await hashPassword(plain);
      const hash2 = await hashPassword(plain);

      expect(hash1).not.toBe(hash2); // Different salt each time
      // But both should still verify correctly
      expect(await comparePassword(plain, hash1)).toBe(true);
      expect(await comparePassword(plain, hash2)).toBe(true);
    });
  });
});
