import MailService from '@sendgrid/mail';

MailService.setApiKey(process.env.SENDGRID_API_KEY!);

const from = '🦄 Chorely <chorely.no.reply@gmail.com>';

export async function sendEmail(email: string, taskTitle: string): Promise<void> {
  try {
    await MailService.send({
      to: email,
      from,
      subject: `“${taskTitle}” was assigned to you.`,
      text: ` `,
    });
  } catch (ex) {
    console.log(ex);
  }
}

export async function sendReminder(email: string, taskTitle: string): Promise<void> {
  try {
    await MailService.send({
      to: email,
      from,
      subject: `[Reminder] “${taskTitle}”.`,
      text: ` `,
    });
  } catch (ex) {
    console.log(ex);
  }
}
