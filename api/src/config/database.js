const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'OficiosYA',
    process.env.DB_USER || 'root',
    process.env.MYSQL_ROOT_PASSWORD || 'root',
    {
        host: process.env.DB_HOST || 'db',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
    }
);

module.exports = sequelize;

