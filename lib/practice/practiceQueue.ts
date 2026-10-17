import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";
import { apiClient, ApiError } from "@/lib/api/client";
import { CreateMeditationSession, CreateNaamJapSession, createMeditationSession, createNaamJapSession } from "@/lib/practice/practiceApi";

const STORAGE_KEY = "@bhak/pending-practice-submissions/v1";
type QueueItem =
  | { id: string; kind: "naam_jap"; payload: CreateNaamJapSession; queuedAt: string; attempts: number; lastError?: string }
  | { id: string; kind: "meditation"; payload: CreateMeditationSession; queuedAt: string; attempts: number; lastError?: string };
export type QueueStatus = { pending: number; syncing: boolean; lastError: string | null };
let flushing: Promise<void> | null = null;
const listeners = new Set<(status: QueueStatus) => void>();
let status: QueueStatus = { pending: 0, syncing: false, lastError: null };
function publish(next: QueueStatus) { status = next; listeners.forEach((listener) => listener(status)); }
export function subscribeQueue(listener: (status: QueueStatus) => void) { listeners.add(listener); listener(status); return () => listeners.delete(listener); }
export function getQueueStatus() { return status; }
async function readQueue(): Promise<QueueItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed as QueueItem[] : []; }
  catch { throw new Error("The pending practice queue could not be read. Please do not clear app storage; contact support."); }
}
async function writeQueue(items: QueueItem[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  publish({ ...status, pending: items.length });
}
export async function enqueueNaamJap(payload: CreateNaamJapSession) {
  const items = await readQueue();
  if (!items.some((item) => item.id === payload.clientSessionId)) {
    items.push({ id: payload.clientSessionId, kind: "naam_jap", payload, queuedAt: new Date().toISOString(), attempts: 0 });
    await writeQueue(items);
  }
  void flushPracticeQueue();
}
export async function enqueueMeditation(payload: CreateMeditationSession) {
  const items = await readQueue();
  if (!items.some((item) => item.id === payload.clientSessionId)) {
    items.push({ id: payload.clientSessionId, kind: "meditation", payload, queuedAt: new Date().toISOString(), attempts: 0 });
    await writeQueue(items);
  }
  void flushPracticeQueue();
}
function permanent(error: unknown) {
  return error instanceof ApiError && [400, 403, 404, 422].includes(error.status);
}
export function flushPracticeQueue(): Promise<void> {
  if (flushing) return flushing;
  flushing = (async () => {
    const items = await readQueue();
    publish({ pending: items.length, syncing: true, lastError: null });
    const remaining = [...items];
    while (remaining.length) {
      const item = remaining[0];
      try {
        if (item.kind === "naam_jap") await createNaamJapSession(item.payload);
        else await createMeditationSession(item.payload);
        remaining.shift();
        await writeQueue(remaining);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Submission failed.";
        item.attempts += 1;
        item.lastError = message;
        if (permanent(error)) {
          // Keep invalid submissions durable and visible instead of silently discarding user activity.
          remaining[0] = item;
          await writeQueue(remaining);
          publish({ pending: remaining.length, syncing: false, lastError: `A saved practice needs attention: ${message}` });
          return;
        }
        remaining[0] = item;
        await writeQueue(remaining);
        publish({ pending: remaining.length, syncing: false, lastError: message });
        return;
      }
    }
    publish({ pending: 0, syncing: false, lastError: null });
  })().catch((error) => {
    publish({ ...status, syncing: false, lastError: error instanceof Error ? error.message : "Could not sync saved practices." });
  }).finally(() => { flushing = null; });
  return flushing;
}
export function installPracticeQueueAutoSync() {
  void flushPracticeQueue();
  const listener = (state: AppStateStatus) => { if (state === "active") void flushPracticeQueue(); };
  const subscription = AppState.addEventListener("change", listener);
  return () => subscription.remove();
}
