export interface User {
  userId: number;
  email: string;
}

interface Chore {
  id: number;
  title: string;
  description: string;
  completionSemaphore: number;
  modifiedOnUTC: string;
}

interface History {
  choreId: number;
  completedOnUTC: string;
  completedById: number;
}
