import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

// Cấu hình MailHog / Mailpit cho môi trường mạng LAN/Offline
const transporter = nodemailer.createTransport({
   host: process.env.SMTP_HOST || "localhost",
   port: Number(process.env.SMTP_PORT) || 1025,
   secure: false, // TLS không bắt buộc ở local
});

export const sendOrderConfirmationEmail = async (
   to: string,
   orderData: any,
) => {
   try {
      const templatePath = path.join(
         __dirname,
         "../../templates/emails/order-confirmation.ejs",
      );

      const html = await ejs.renderFile(templatePath, { order: orderData });

      await transporter.sendMail({
         from: '"Shop Me System" <no-reply@shop-me.local>',
         to,
         subject: `Xác nhận đơn hàng #${orderData.id}`,
         html,
      });
      console.log(`Đã gửi email xác nhận cho đơn hàng #${orderData.id}`);
   } catch (error) {
      console.error("Lỗi gửi mail:", error);
   }
};
