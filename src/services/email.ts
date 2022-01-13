import MailService from '@sendgrid/mail';
import { DbChore, User } from '../types';
import { findOtherUser } from '../repository/users';

MailService.setApiKey(process.env.SENDGRID_API_KEY!);

const from = '🦄 Chorely <chorely.no.reply@gmail.com>';

export async function sendEmail(currentUser: User, chore: DbChore): Promise<void> {
  const otherUser = findOtherUser(currentUser);

  if (!otherUser) {
    console.log('Could not find other user.', JSON.stringify(currentUser));
    return;
  }

  try {
    await MailService.send({
      to: otherUser.email,
      from,
      subject: `“${chore.title}” was assigned to you.`,
      text: ` `,
    });
  } catch (ex) {
    console.log(ex);
  }
}

export async function sendReminder(currentUser: User, chore: DbChore): Promise<void> {
  const otherUser = findOtherUser(currentUser);

  if (!otherUser) {
    console.log('Could not find other user.', JSON.stringify(currentUser));
    return;
  }

  try {
    await MailService.send({
      to: otherUser.email,
      from,
      subject: `[Reminder] “${chore.title}”.`,
      text: ` `,
    });
  } catch (ex) {
    console.log(ex);
  }
}
