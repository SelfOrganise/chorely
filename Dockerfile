FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY . .
RUN yarn global add pnpm && pnpm --filter api i --prod

RUN pnpm --filter api build

FROM node:18-alpine AS runner

WORKDIR api

COPY --from=build /app/packages/api/dist ./

ENV PORT 3000
CMD [ "node", "index.js" ]
