const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const UserRoutes = require('../Routes/UsuarioRoutes.js');
const RolRoutes = require('../Routes/RolRoutes.js');
const { sequelize } = require('../Models/Index.js');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', UserRoutes);
app.use('/api/roles', RolRoutes);

sequelize.authenticate()
    .then(async () => {
        console.log('Database connection has been established successfully. Database:', process.env.MYSQL_DATABASE);
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = app;