interface Chore {
  id: number;
  title: string;
  description: string;
  completionSemaphore: number;
  modifiedOnUTC: string;
  isLate?: boolean;
}
