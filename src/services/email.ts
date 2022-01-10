import MailService from "@sendgrid/mail";

MailService.setApiKey(process.env.SENDGRID_API_KEY!);

const template = {
  to: "byte1918@gmail.com",
  from: "byte1918@gmail.com",
  subject: "Fewture: ",
  text: "just dew it",
};

export async function sendEmail(): Promise<void> {
  try {
    await MailService.send(template);
    console.log("Sent mail");
  } catch (ex) {
    console.log(ex);
  }
}
