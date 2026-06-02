// auth.test.ts
// STEMM Lab — Authentication Test Suite
// Covers: Unit Tests, Integration Tests, and E2E Tests
// All tests are based on the real auth functions in lib/auth.ts

// ─────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock("../lib/firebase", () => ({
  auth: {},
}));

jest.mock("../lib/firestore", () => ({
  createUserDocument: jest.fn(),
  createTeamDocument: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
  Link: ({ children }: any) => children,
}));

jest.mock("../assets/images/campuslogo.png", () => "campuslogo");

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { router } from "expo-router";
import { getAuthErrorMessage, logIn, logOut, signUp } from "../lib/auth";
import { createTeamDocument, createUserDocument } from "../lib/firestore";

const mockSignIn = signInWithEmailAndPassword as jest.Mock;
const mockSignOut = signOut as jest.Mock;
const mockCreateUser = createUserWithEmailAndPassword as jest.Mock;
const mockUpdateProfile = updateProfile as jest.Mock;
const mockCreateTeam = createTeamDocument as jest.Mock;
const mockCreateUserDoc = createUserDocument as jest.Mock;
const mockRouterReplace = router.replace as jest.Mock;

// ─────────────────────────────────────────────
// UNIT TESTS — getAuthErrorMessage
// ─────────────────────────────────────────────

describe("Unit Tests — getAuthErrorMessage", () => {
  test("returns correct message for email-already-in-use", () => {
    expect(getAuthErrorMessage("auth/email-already-in-use")).toBe(
      "An account with this email already exists.",
    );
  });

  test("returns correct message for invalid-email", () => {
    expect(getAuthErrorMessage("auth/invalid-email")).toBe(
      "Please enter a valid email address.",
    );
  });

  test("returns correct message for wrong-password", () => {
    expect(getAuthErrorMessage("auth/wrong-password")).toBe(
      "Incorrect email or password.",
    );
  });

  test("returns correct message for user-not-found", () => {
    expect(getAuthErrorMessage("auth/user-not-found")).toBe(
      "Incorrect email or password.",
    );
  });

  test("returns correct message for invalid-credential", () => {
    expect(getAuthErrorMessage("auth/invalid-credential")).toBe(
      "Incorrect email or password.",
    );
  });

  test("returns correct message for weak-password", () => {
    expect(getAuthErrorMessage("auth/weak-password")).toBe(
      "Password must be at least 6 characters.",
    );
  });

  test("returns correct message for too-many-requests", () => {
    expect(getAuthErrorMessage("auth/too-many-requests")).toBe(
      "Too many attempts. Please wait a few minutes and try again.",
    );
  });

  test("returns correct message for network-request-failed", () => {
    expect(getAuthErrorMessage("auth/network-request-failed")).toBe(
      "Network error. Check your internet connection.",
    );
  });

  test("returns fallback message for unknown error code", () => {
    expect(getAuthErrorMessage("auth/unknown-error")).toBe(
      "Something went wrong. Please try again.",
    );
  });

  test("returns fallback message when no code provided", () => {
    expect(getAuthErrorMessage(undefined)).toBe(
      "Something went wrong. Please try again.",
    );
  });
});

// ─────────────────────────────────────────────
// UNIT TESTS — logIn function
// ─────────────────────────────────────────────

describe("Unit Tests — logIn", () => {
  beforeEach(() => jest.clearAllMocks());

  test("calls signInWithEmailAndPassword with trimmed lowercase email", async () => {
    const mockUser = { uid: "user123", email: "test@example.com" };
    mockSignIn.mockResolvedValueOnce({ user: mockUser });

    const user = await logIn("  Test@Example.com  ", "password123");

    expect(mockSignIn).toHaveBeenCalledWith(
      {},
      "test@example.com",
      "password123",
    );
    expect(user).toEqual(mockUser);
  });

  test("throws error when Firebase rejects login", async () => {
    const error = { code: "auth/invalid-credential" };
    mockSignIn.mockRejectedValueOnce(error);

    await expect(logIn("test@example.com", "wrongpass")).rejects.toEqual(error);
  });
});

// ─────────────────────────────────────────────
// UNIT TESTS — logOut function
// ─────────────────────────────────────────────

describe("Unit Tests — logOut", () => {
  beforeEach(() => jest.clearAllMocks());

  test("calls Firebase signOut", async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    await logOut();
    expect(mockSignOut).toHaveBeenCalledWith({});
  });
});

// ─────────────────────────────────────────────
// INTEGRATION TESTS — LoginScreen component
// ─────────────────────────────────────────────

describe("Integration Tests — LoginScreen", () => {
  beforeEach(() => jest.clearAllMocks());

  test("logIn called with correct email and password", async () => {
    mockSignIn.mockResolvedValueOnce({ user: { uid: "user123" } });
    await logIn("test@example.com", "password123");
    expect(mockSignIn).toHaveBeenCalledWith(
      {},
      "test@example.com",
      "password123",
    );
  });

  test("logIn trims and lowercases email before calling Firebase", async () => {
    mockSignIn.mockResolvedValueOnce({ user: { uid: "user123" } });
    await logIn("  TEST@EXAMPLE.COM  ", "password123");
    expect(mockSignIn).toHaveBeenCalledWith(
      {},
      "test@example.com",
      "password123",
    );
  });

  test("logIn throws and getAuthErrorMessage returns correct message", async () => {
    mockSignIn.mockRejectedValueOnce({ code: "auth/wrong-password" });
    try {
      await logIn("test@example.com", "wrong");
    } catch (error: any) {
      const message = getAuthErrorMessage(error.code);
      expect(message).toBe("Incorrect email or password.");
    }
  });

  test("logOut calls Firebase signOut successfully", async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    await logOut();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  test("getAuthErrorMessage returns network error message", () => {
    expect(getAuthErrorMessage("auth/network-request-failed")).toBe(
      "Network error. Check your internet connection.",
    );
  });

  test("getAuthErrorMessage returns too-many-requests message", () => {
    expect(getAuthErrorMessage("auth/too-many-requests")).toBe(
      "Too many attempts. Please wait a few minutes and try again.",
    );
  });
});

// ─────────────────────────────────────────────
// E2E TEST — Full sign up flow
// ─────────────────────────────────────────────

describe("E2E Tests — signUp flow", () => {
  beforeEach(() => jest.clearAllMocks());

  test("creates user, updates profile, creates team and user documents", async () => {
    const mockUser = { uid: "newuser123", email: "new@example.com" };
    mockCreateUser.mockResolvedValueOnce({ user: mockUser });
    mockUpdateProfile.mockResolvedValueOnce(undefined);
    mockCreateTeam.mockResolvedValueOnce(undefined);
    mockCreateUserDoc.mockResolvedValueOnce(undefined);

    const user = await signUp({
      email: "new@example.com",
      password: "password123",
      firstName: "Alex",
      teamName: "STEMM Stars",
      yearLevel: "Year 10",
      members: ["Bob", "Carol"],
    });

    expect(mockCreateUser).toHaveBeenCalledWith(
      {},
      "new@example.com",
      "password123",
    );
    expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
      displayName: "Alex",
    });
    expect(mockCreateTeam).toHaveBeenCalledWith(
      expect.objectContaining({
        teamName: "STEMM Stars",
        yearLevel: "Year 10",
        members: ["Bob", "Carol"],
        ownerId: "newuser123",
      }),
    );
    expect(mockCreateUserDoc).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "newuser123",
        firstName: "Alex",
        role: "student",
      }),
    );
    expect(user).toEqual(mockUser);
  });

  test("trims whitespace from email, firstName, teamName and members", async () => {
    const mockUser = { uid: "user456", email: "trimmed@example.com" };
    mockCreateUser.mockResolvedValueOnce({ user: mockUser });
    mockUpdateProfile.mockResolvedValueOnce(undefined);
    mockCreateTeam.mockResolvedValueOnce(undefined);
    mockCreateUserDoc.mockResolvedValueOnce(undefined);

    await signUp({
      email: "  Trimmed@Example.com  ",
      password: "password123",
      firstName: "  Alex  ",
      teamName: "  STEMM Stars  ",
      yearLevel: "  Year 10  ",
      members: ["  Bob  ", "  Carol  ", ""],
    });

    expect(mockCreateUser).toHaveBeenCalledWith(
      {},
      "trimmed@example.com",
      "password123",
    );
    expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, {
      displayName: "Alex",
    });
    expect(mockCreateTeam).toHaveBeenCalledWith(
      expect.objectContaining({
        teamName: "STEMM Stars",
        yearLevel: "Year 10",
        members: ["Bob", "Carol"], // empty string filtered out
      }),
    );
  });

  test("throws error if Firebase createUserWithEmailAndPassword fails", async () => {
    const error = { code: "auth/email-already-in-use" };
    mockCreateUser.mockRejectedValueOnce(error);

    await expect(
      signUp({
        email: "existing@example.com",
        password: "password123",
        firstName: "Alex",
        teamName: "STEMM Stars",
        yearLevel: "Year 10",
        members: [],
      }),
    ).rejects.toEqual(error);

    // Team and user documents should NOT be created if user creation fails
    expect(mockCreateTeam).not.toHaveBeenCalled();
    expect(mockCreateUserDoc).not.toHaveBeenCalled();
  });
});
