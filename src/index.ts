import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { completeChore, getChores, remind, undoChore } from './repository/chores';
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
  const choreId = parseInt(req.params.id);

  if (res.locals.user == null) {
    console.log(`Could not complete chore ${choreId} because user was null.`);
    return;
  }

  await completeChore(choreId, res.locals.user);
  res.sendStatus(204);
});

app.post('/chores/:id/undo', async (req, res) => {
  const choreId = parseInt(req.params.id);

  if (res.locals.user == null) {
    console.log(`Could not undo chore ${choreId} because user was null.`);
    return;
  }

  await undoChore(choreId, res.locals.user);
  res.sendStatus(204);
});

app.post('/chores/:id/remind', async (req, res) => {
  const choreId = parseInt(req.params.id);

  if (res.locals.user == null) {
    console.log(`Could not send reminder for ${choreId} because user was null.`);
    return;
  }

  await remind(choreId, res.locals.user);
  res.sendStatus(204);
});

app.get('/healthz', (req, res) => {
  res.sendStatus(200);
});

app.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:${port}`));
