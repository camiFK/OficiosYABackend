const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

class EmailService {
    constructor() {
        // Crear transporter solo si hay configuración SMTP
        if (emailConfig.smtp.auth.user && emailConfig.smtp.auth.pass) {
            this.transporter = nodemailer.createTransport(emailConfig.smtp);
        } else {
            this.transporter = null;
            console.warn('SMTP no configurado. Los emails se mostrarán en consola.');
        }
    }

    // Envía email de recuperación de contraseña
    async sendPasswordResetEmail(correo, token) {
        const resetUrl = `${emailConfig.frontendUrl}/recuperar-contrasena?token=${token}`;
        
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
                // Mostrar en consola
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

    // Notificaciones por email para eventos del sistema

    // Envía email cuando se crea una nueva solicitud
    async sendNewRequestNotification(prestadorEmail, prestadorName, solicitudTitulo, clienteName) {
        const subject = 'Nueva solicitud de presupuesto - OficiosYA';
        const htmlContent = this.getNewRequestTemplate(prestadorName, solicitudTitulo, clienteName);
        const textContent = this.getNewRequestTextTemplate(prestadorName, solicitudTitulo, clienteName);

        const mailOptions = {
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: prestadorEmail,
            subject,
            html: htmlContent,
            text: textContent
        };

        return await this.sendEmail(mailOptions);
    }

    // Envía email cuando se recibe un presupuesto
    async sendBudgetReceivedNotification(clienteEmail, clienteName, prestadorName, solicitudTitulo) {
        const subject = 'Nuevo presupuesto recibido - OficiosYA';
        const htmlContent = this.getBudgetReceivedTemplate(clienteName, prestadorName, solicitudTitulo);
        const textContent = this.getBudgetReceivedTextTemplate(clienteName, prestadorName, solicitudTitulo);

        const mailOptions = {
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: clienteEmail,
            subject,
            html: htmlContent,
            text: textContent
        };

        return await this.sendEmail(mailOptions);
    }

    // Envía email cuando se acepta un presupuesto
    async sendBudgetAcceptedNotification(prestadorEmail, prestadorName, clienteName, solicitudTitulo) {
        const subject = '¡Tu presupuesto fue aceptado! - OficiosYA';
        const htmlContent = this.getBudgetAcceptedTemplate(prestadorName, clienteName, solicitudTitulo);
        const textContent = this.getBudgetAcceptedTextTemplate(prestadorName, clienteName, solicitudTitulo);

        const mailOptions = {
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: prestadorEmail,
            subject,
            html: htmlContent,
            text: textContent
        };

        return await this.sendEmail(mailOptions);
    }

    // Envía email cuando se recibe una calificación
    async sendRatingReceivedNotification(prestadorEmail, prestadorName, clienteName, estrellas, solicitudTitulo) {
        const subject = 'Nueva calificación recibida - OficiosYA';
        const htmlContent = this.getRatingReceivedTemplate(prestadorName, clienteName, estrellas, solicitudTitulo);
        const textContent = this.getRatingReceivedTextTemplate(prestadorName, clienteName, estrellas, solicitudTitulo);

        const mailOptions = {
            from: `"${emailConfig.from.name}" <${emailConfig.from.email}>`,
            to: prestadorEmail,
            subject,
            html: htmlContent,
            text: textContent
        };

        return await this.sendEmail(mailOptions);
    }

    // TEMPLATES HTML PARA NOTIFICACIONES

    getNewRequestTemplate(prestadorName, solicitudTitulo, clienteName) {
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
                .highlight { background-color: #e8f5e8; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>OficiosYA</h1>
                    <p>Nueva solicitud de presupuesto</p>
                </div>
                <div class="content">
                    <h2>¡Hola ${prestadorName}!</h2>
                    <div class="highlight">
                        <h3>Nueva solicitud recibida</h3>
                        <p><strong>Cliente:</strong> ${clienteName}</p>
                        <p><strong>Servicio solicitado:</strong> ${solicitudTitulo}</p>
                    </div>
                    <p>Ingresa a tu panel de prestador para revisar los detalles y enviar tu presupuesto.</p>
                    <p>¡No pierdas esta oportunidad!</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} OficiosYA. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getBudgetReceivedTemplate(clienteName, prestadorName, solicitudTitulo) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; }
                .highlight { background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>OficiosYA</h1>
                    <p>Presupuesto recibido</p>
                </div>
                <div class="content">
                    <h2>¡Hola ${clienteName}!</h2>
                    <div class="highlight">
                        <h3>Nuevo presupuesto recibido</h3>
                        <p><strong>Prestador:</strong> ${prestadorName}</p>
                        <p><strong>Servicio:</strong> ${solicitudTitulo}</p>
                    </div>
                    <p>Ingresa a tu panel para revisar el presupuesto y aceptarlo si te interesa.</p>
                    <p>Puedes comparar diferentes presupuestos antes de decidir.</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} OficiosYA. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getBudgetAcceptedTemplate(prestadorName, clienteName, solicitudTitulo) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; }
                .highlight { background-color: #fff3e0; padding: 15px; border-left: 4px solid #FF9800; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>OficiosYA</h1>
                    <p>¡Presupuesto aceptado!</p>
                </div>
                <div class="content">
                    <h2>¡Felicitaciones ${prestadorName}!</h2>
                    <div class="highlight">
                        <h3>Tu presupuesto fue aceptado</h3>
                        <p><strong>Cliente:</strong> ${clienteName}</p>
                        <p><strong>Servicio:</strong> ${solicitudTitulo}</p>
                    </div>
                    <p>Ahora puedes comenzar con el trabajo. Mantén una buena comunicación con tu cliente y ofrece un servicio de calidad.</p>
                    <p>Recuerda marcar la solicitud como completada cuando termines.</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} OficiosYA. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getRatingReceivedTemplate(prestadorName, clienteName, estrellas, solicitudTitulo) {
        const stars = '⭐'.repeat(estrellas);
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; }
                .rating { font-size: 24px; text-align: center; margin: 20px 0; }
                .highlight { background-color: #f3e5f5; padding: 15px; border-left: 4px solid #9C27B0; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>OficiosYA</h1>
                    <p>Nueva calificación</p>
                </div>
                <div class="content">
                    <h2>Hola ${prestadorName},</h2>
                    <div class="rating">
                        <h3>Calificación recibida</h3>
                        <p style="font-size: 32px;">${stars}</p>
                        <p><strong>${estrellas} de 5 estrellas</strong></p>
                    </div>
                    <div class="highlight">
                        <p><strong>Cliente:</strong> ${clienteName}</p>
                        <p><strong>Servicio:</strong> ${solicitudTitulo}</p>
                    </div>
                    <p>¡Gracias por tu excelente trabajo! Las calificaciones positivas ayudan a que más clientes te encuentren en la plataforma.</p>
                    <p>Sigue ofreciendo servicios de calidad.</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} OficiosYA. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // TEMPLATES TEXTO PLANO

    getNewRequestTextTemplate(prestadorName, solicitudTitulo, clienteName) {
        return `
Hola ${prestadorName},

¡Tienes una nueva solicitud de presupuesto!

Cliente: ${clienteName}
Servicio solicitado: ${solicitudTitulo}

Ingresa a tu panel para enviar tu presupuesto.

Saludos,
OficiosYA
        `.trim();
    }

    getBudgetReceivedTextTemplate(clienteName, prestadorName, solicitudTitulo) {
        return `
Hola ${clienteName},

Has recibido un presupuesto de ${prestadorName} para tu solicitud:
"${solicitudTitulo}"

Ingresa a tu panel para revisarlo.

Saludos,
OficiosYA
        `.trim();
    }

    getBudgetAcceptedTextTemplate(prestadorName, clienteName, solicitudTitulo) {
        return `
¡Felicitaciones ${prestadorName}!

Tu presupuesto para "${solicitudTitulo}" ha sido aceptado por ${clienteName}.

Ahora puedes comenzar con el trabajo.

Saludos,
OficiosYA
        `.trim();
    }

    getRatingReceivedTextTemplate(prestadorName, clienteName, estrellas, solicitudTitulo) {
        return `
Hola ${prestadorName},

Has recibido una calificación de ${estrellas} estrella(s) de ${clienteName} por el servicio "${solicitudTitulo}".

¡Gracias por tu trabajo!

Saludos,
OficiosYA
        `.trim();
    }
}

module.exports = new EmailService();