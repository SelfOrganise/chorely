import { User } from '../types';

const users = {
  [process.env.USER_1_USERNAME!]: {
    userId: parseInt(process.env.USER_1_SEMAPHORE_VALUE!),
    email: process.env.USER_1_EMAIL!,
  },
  [process.env.USER_2_USERNAME!]: {
    userId: parseInt(process.env.USER_2_SEMAPHORE_VALUE!),
    email: process.env.USER_2_EMAIL!,
  },
};

export function findUser(username: string | undefined): User | null | undefined {
  if (!username) {
    return null;
  }

  return users[username];
}

export function findUserByUserId(userId: number): User | undefined {
  return Object.values(users).find(v => v.userId === userId);
}

export function findOtherUser(user: User): User | undefined {
  return Object.values(users).find(v => v.userId !== user.userId);
}
