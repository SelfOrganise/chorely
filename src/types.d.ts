export interface User {
  userId: number;
  email: string;
}

interface Chore {
  id: number;
  title: string;
  description: string;
  completions: Array<number>;
}

interface History {
  choreId: number;
  completedOnUTC: string;
  completedById: number;
}
