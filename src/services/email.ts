import MailService from '@sendgrid/mail';
import { DbAssignment, DbUser, User } from '../types';

MailService.setApiKey(process.env.SENDGRID_API_KEY!);

const from = '🦄 Chorely <chorely.no.reply@gmail.com>';

export async function sendEmail(targetUser: DbUser, taskTitle: string): Promise<void> {
  try {
    await MailService.send({
      to: targetUser.email,
      from,
      subject: `“${taskTitle}” was assigned to you.`,
      text: ` `,
    });
  } catch (ex) {
    console.log(ex);
  }
}

export async function sendReminder(currentUser: User, chore: DbAssignment): Promise<void> {
  // const otherUser = findOtherUser(currentUser);
  //
  // if (!otherUser) {
  //   console.log('Could not find other user.', JSON.stringify(currentUser));
  //   return;
  // }
  //
  // try {
  //   await MailService.send({
  //     to: otherUser.email,
  //     from,
  //     subject: `[Reminder] “${chore.title}”.`,
  //     text: ` `,
  //   });
  // } catch (ex) {
  //   console.log(ex);
  // }
}
