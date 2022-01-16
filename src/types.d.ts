import { ChoreActions } from "./routes/chores";

export interface User {
  userId: number;
  email: string;
}

interface Chore extends DbChore {
  isLate?: boolean;
}

interface DbChore {
  id: number;
  title: string;
  description: string;
  cron: string;
  hoursLeftReminder?: number;
  completionSemaphore: number;
  modifiedOnUTC: string;
}

interface History {
  choreId: number;
  completedOnUTC: string;
  completedById: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: User;
    choreId: number;
  }

  interface FastifyRequestBody {

  }
}
