import type { Config } from "jest";

const config: Config = {
  // ──────────────────────────────────────────────
  // Global settings shared across all test suites
  // ──────────────────────────────────────────────
  preset: "ts-jest",
  testEnvironment: "node",

  // Path alias matching tsconfig's "@/*" → "./*"
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // ──────────────────────────────────────────────
  // Projects – add new entries here when you need
  // component tests (jsdom), integration, e2e, etc.
  // ──────────────────────────────────────────────
  projects: [
    {
      displayName: "unit",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["<rootDir>/__tests__/unit/**/*.test.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
    },
    // ── Future: uncomment to add component tests ─
    // {
    //   displayName: "component",
    //   preset: "ts-jest",
    //   testEnvironment: "jest-environment-jsdom",
    //   testMatch: ["<rootDir>/__tests__/component/**/*.test.tsx"],
    //   moduleNameMapper: {
    //     "^@/(.*)$": "<rootDir>/$1",
    //   },
    // },
  ],
};

export default config;
