import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { firebaseAuth } from "./client";
import type { User } from "@/types";

export function firebaseUserToAppUser(fbUser: FirebaseUser): User {
  const [firstName = "", ...rest] = (fbUser.displayName ?? "").split(" ");
  const lastName = rest.join(" ");
  return {
    id: fbUser.uid,
    firstName: firstName || fbUser.email?.split("@")[0] || "",
    lastName,
    email: fbUser.email ?? "",
  };
}

async function exchangeForSessionCookie(fbUser: FirebaseUser): Promise<void> {
  const idToken = await fbUser.getIdToken();
  const res = await fetch("/api/session/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `session exchange failed (${res.status})`);
  }
}

async function clearSessionCookie(): Promise<void> {
  await fetch("/api/session/logout", { method: "POST" }).catch(() => {
    // Swallow — the user is signing out regardless.
  });
}

export async function signInWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
  await exchangeForSessionCookie(cred.user);
  return cred.user;
}

export async function signUpWithEmail(
  firstName: string,
  lastName: string,
  email: string,
  password: string
) {
  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(cred.user, {
    displayName: `${firstName} ${lastName}`.trim(),
  });
  await exchangeForSessionCookie(cred.user);
  return cred.user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(firebaseAuth, provider);
  await exchangeForSessionCookie(cred.user);
  return cred.user;
}

export async function signInWithApple() {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  const cred = await signInWithPopup(firebaseAuth, provider);
  await exchangeForSessionCookie(cred.user);
  return cred.user;
}

export async function sendPasswordReset(email: string) {
  await sendPasswordResetEmail(firebaseAuth, email);
}

export async function firebaseSignOut() {
  await clearSessionCookie();
  await signOut(firebaseAuth);
}
