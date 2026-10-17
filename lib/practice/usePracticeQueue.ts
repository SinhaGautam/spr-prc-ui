import { useEffect, useState } from "react";
import { getQueueStatus, QueueStatus, subscribeQueue } from "@/lib/practice/practiceQueue";
export function usePracticeQueue(): QueueStatus {
  const [status, setStatus] = useState<QueueStatus>(getQueueStatus());
  useEffect(() => subscribeQueue(setStatus), []);
  return status;
}
