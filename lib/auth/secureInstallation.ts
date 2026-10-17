import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const INSTALLATION_ID_KEY = "bhak.auth.installationId";
const INSTALLATION_SECRET_KEY = "bhak.auth.installationSecret";
const ACCESS_TOKEN_KEY = "bhak.auth.accessToken";
const ACCESS_TOKEN_EXPIRY_KEY = "bhak.auth.accessTokenExpiresAt";

export type InstallationCredentials = {
  installationId: string;
  installationSecret: string;
};

function assertNativeSecureStorage(): void {
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    throw new Error("Bhak authentication currently requires iOS or Android secure storage.");
  }
}

function base64Url(bytes: Uint8Array): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let output = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const hasB = i + 1 < bytes.length;
    const hasC = i + 2 < bytes.length;
    const b = hasB ? bytes[i + 1] : 0;
    const c = hasC ? bytes[i + 2] : 0;
    output += alphabet[a >> 2];
    output += alphabet[((a & 3) << 4) | (b >> 4)];
    if (hasB) output += alphabet[((b & 15) << 2) | (c >> 6)];
    if (hasC) output += alphabet[c & 63];
  }
  return output;
}

function uuidFromBytes(bytes: Uint8Array): string {
  const copy = new Uint8Array(bytes);
  copy[6] = (copy[6] & 0x0f) | 0x40;
  copy[8] = (copy[8] & 0x3f) | 0x80;
  const hex = Array.from(copy, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function loadOrCreateInstallationCredentials(): Promise<InstallationCredentials> {
  assertNativeSecureStorage();
  const [installationId, installationSecret] = await Promise.all([
    SecureStore.getItemAsync(INSTALLATION_ID_KEY),
    SecureStore.getItemAsync(INSTALLATION_SECRET_KEY),
  ]);
  if (installationId && installationSecret) return { installationId, installationSecret };

  // Persist the generated secret before attempting network access so retries use
  // the same installation identity and do not accidentally create duplicate users.
  const [idBytes, secretBytes] = await Promise.all([
    Crypto.getRandomBytesAsync(16),
    Crypto.getRandomBytesAsync(32),
  ]);
  const credentials = {
    installationId: uuidFromBytes(idBytes),
    installationSecret: base64Url(secretBytes),
  };
  await SecureStore.setItemAsync(INSTALLATION_ID_KEY, credentials.installationId);
  await SecureStore.setItemAsync(INSTALLATION_SECRET_KEY, credentials.installationSecret);
  return credentials;
}

export async function saveAccessSession(token: string, expiresAt: string): Promise<void> {
  assertNativeSecureStorage();
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token),
    SecureStore.setItemAsync(ACCESS_TOKEN_EXPIRY_KEY, expiresAt),
  ]);
}

export async function clearAccessSession(): Promise<void> {
  assertNativeSecureStorage();
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(ACCESS_TOKEN_EXPIRY_KEY),
  ]);
}

export async function readAccessSession(): Promise<{ token: string; expiresAt: string } | null> {
  assertNativeSecureStorage();
  const [token, expiresAt] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(ACCESS_TOKEN_EXPIRY_KEY),
  ]);
  return token && expiresAt ? { token, expiresAt } : null;
}
