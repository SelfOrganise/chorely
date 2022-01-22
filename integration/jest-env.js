const env = {
  DB_HOST: 'localhost',
  DB_PORT: 5433,
  DB_USER: 'postgres',
  DB_DATABASE: 'postgres',
  DB_PASSWORD: 'test',

  SENDGRID_API_KEY: 'SG.notset',

  USER_1_SEMAPHORE_VALUE: 1,
  USER_1_USERNAME: 'first',
  USER_1_EMAIL: 'first@gmail.com',

  USER_2_SEMAPHORE_VALUE: -1,
  USER_2_USERNAME: 'second',
  USER_2_EMAIL: 'second@gmail.com',
  PORT: 4001,
};


for(const [key, value] of Object.entries(env)) {
  process.env[key] = String(value);
}
