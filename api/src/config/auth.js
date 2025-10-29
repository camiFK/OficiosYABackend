module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura',
    jwtExpiration: '24h',
    bcryptRounds: 10,
    resetTokenExpiration: '1h'
};