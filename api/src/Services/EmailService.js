const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

class EmailService {
    constructor() {
        // Crear transporter solo si hay configuración SMTP
        if (emailConfig.smtp.auth.user && emailConfig.smtp.auth.pass) {
            this.transporter = nodemailer.createTransport(emailConfig.smtp);
        } else {
            this.transporter = null;
            console.warn('⚠️  SMTP no configurado. Los emails se mostrarán en consola.');
        }
    }

    // Envía email de recuperación de contraseña
    async sendPasswordResetEmail(correo, token) {
        const resetUrl = `${emailConfig.frontendUrl}/reset-password?token=${token}`;
        
        const mailOptions = {
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: correo,
            subject: 'Restablecimiento de contraseña - OficiosYA',
            html: this.getPasswordResetTemplate(resetUrl),
            text: this.getPasswordResetTextTemplate(resetUrl)
        };

        return await this.sendEmail(mailOptions);
    }

    // Envía mail de bienvenida
    async sendWelcomeEmail(correo, nombre) {
        const mailOptions = {
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: correo,
            subject: '¡Bienvenido a OficiosYA!',
            html: this.getWelcomeTemplate(nombre),
            text: `¡Bienvenido a OficiosYA, ${nombre}!`
        };

        return await this.sendEmail(mailOptions);
    }

    // Método genérico para enviar emails
    async sendEmail(mailOptions) {
        try {
            if (this.transporter) {
                const info = await this.transporter.sendMail(mailOptions);
                console.log(`Email enviado: ${info.messageId}`);
                return { success: true, messageId: info.messageId };
            } else {
                //mostrar en consola
                console.log('\n=== EMAIL (MODO DESARROLLO) ===');
                console.log(`Para: ${mailOptions.to}`);
                console.log(`Asunto: ${mailOptions.subject}`);
                console.log(`Contenido:\n${mailOptions.text || mailOptions.html}`);
                console.log('================================\n');
                return { success: true, mode: 'development' };
            }
        } catch (error) {
            console.error('Error al enviar email:', error);
            throw new Error('No fue posible enviar el correo electrónico');
        }
    }

    // Template HTML para recuperación de contraseña
    getPasswordResetTemplate(resetUrl) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; }
                .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; 
                          color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>OficiosYA</h1>
                </div>
                <div class="content">
                    <h2>Restablecimiento de contraseña</h2>
                    <p>Hola,</p>
                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                    <p>Haz clic en el siguiente botón para continuar:</p>
                    <a href="${resetUrl}" class="button">Restablecer contraseña</a>
                    <p><small>O copia y pega este enlace en tu navegador:<br>${resetUrl}</small></p>
                    <p><strong>Este enlace expirará en 1 hora.</strong></p>
                    <p>Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} OficiosYA. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Template texto plano para recuperación de contraseña
    getPasswordResetTextTemplate(resetUrl) {
        return `
Restablecimiento de contraseña - OficiosYA

Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Haz clic en el siguiente enlace para continuar:
${resetUrl}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.

Saludos,
Equipo de OficiosYA
        `;
    }

    // Template de bienvenida
    getWelcomeTemplate(nombre) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Bienvenido a OficiosYA!</h1>
                </div>
                <div class="content">
                    <h2>Hola ${nombre},</h2>
                    <p>Tu cuenta ha sido creada exitosamente.</p>
                    <p>Ahora puedes comenzar a usar nuestra plataforma para conectar con profesionales o ofrecer tus servicios.</p>
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} OficiosYA. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = new EmailService();