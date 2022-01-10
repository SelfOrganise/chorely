import MailService from '@sendgrid/mail';
import { Chore, User } from '../types';
import { findOtherUser } from '../repository/users';

MailService.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(currentUser: User, chore: Chore): Promise<void> {
  const otherUser = findOtherUser(currentUser);

  if (!otherUser) {
    console.log('Could not find other user.', JSON.stringify(currentUser));
    return;
  }

  try {
    await MailService.send({
      to: otherUser.email,
      from: 'byte1918@gmail.com',
      subject: `Chorely: You have been assigned « ${chore.title} »`,
      text: `tbd`,
    });
  } catch (ex) {
    console.log(ex);
  }
}
