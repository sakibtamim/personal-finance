import { describe, expect, it } from "vitest";

import { getFirebaseAuthErrorMessage } from "@/lib/firebase/error-messages";

describe("firebase auth error messages", () => {
  it("returns mapped message for known auth code", () => {
    expect(
      getFirebaseAuthErrorMessage(
        { code: "auth/invalid-email" },
        "Fallback message",
      ),
    ).toBe("Please enter a valid email address.");
  });

  it("returns fallback for unknown auth code", () => {
    expect(
      getFirebaseAuthErrorMessage(
        { code: "auth/some-unknown-code" },
        "Fallback message",
      ),
    ).toBe("Fallback message");
  });

  it("returns fallback when error has no code", () => {
    expect(getFirebaseAuthErrorMessage(new Error("x"), "Fallback message")).toBe(
      "Fallback message",
    );
  });
});
