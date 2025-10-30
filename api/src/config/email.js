module.exports = {
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    },
    from: {
        name: 'OficiosYA',
        email: process.env.SMTP_FROM || 'noreply@oficiosya.com'
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};