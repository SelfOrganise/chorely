const users = {
  [process.env.USER_1_USERNAME!]: parseInt(process.env.USER_1_SEMAPHORE_VALUE!),
  [process.env.USER_2_USERNAME!]: parseInt(process.env.USER_2_SEMAPHORE_VALUE!),
};

export function findUser(username: string | undefined): number | null | undefined {
  if (!username) {
    return null;
  }

  return users[username];
}
