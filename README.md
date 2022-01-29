### Config

1. Create an .env file with the following:
    ```
    DB_HOST=
    DB_PORT=
    DB_USER=
    DB_DATABASE=
    DB_PASSWORD=

    SENDGRID_API_KEY=
    ```

2. Start DB

    `docker compose up`

3. Run DB migrations

    `DATABASE_URL=postgres://postgres:local@localhost:5432/postgres npm run migrate up`

4. Start local dev

    `yarn dev`

