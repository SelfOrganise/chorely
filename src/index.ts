import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { completeChore, getChores } from './repository/chores';
import cookieParser from 'cookie-parser';
import { findUser, findUserByUserId } from './repository/users';

const port = process.env.PORT || 4000;

const app = express();
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(bodyParser.json());
app.use(cookieParser());

// auth
app.use((req, res, next) => {
  if (req.url.startsWith('/login?')) {
    const user = findUser(req.query['username']?.toString());
    if (user) {
      res.send({ userId: user.userId });
    } else {
      res.sendStatus(401);
    }
  } else {
    const userId = parseInt(req.header('X-UserId')!);
    if (isNaN(userId)) {
      res.sendStatus(401);
    } else {
      const user = findUserByUserId(userId);
      res.locals.user = user;
      next();
    }
  }
});

app.get('/chores/current', async (req, res) => {
  const chores = await getChores();
  res.send(chores);
});

app.post('/chores/:id', async (req, res) => {
  await completeChore(parseInt(req.params.id), res.locals.user);
  res.sendStatus(204);
});

app.get('/healthz', (req, res) => {
  res.sendStatus(200);
});

app.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:${port}`));
