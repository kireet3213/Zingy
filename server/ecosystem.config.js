// const path = require('path');
import { path } from 'node:path';
import { config } from 'dotenv';
config({
    path: path.join(__dirname, '.env'),
});

module.exports = {
    apps: [
        {
            name: 'zingy',
            script: 'dist/app.js',
            watch: '.',
            env_production: {
                NODE_ENV: 'production',
                PORT: process.env.PORT,
                DB_DIALECT: process.env.DB_DIALECT,
                DB_HOST: process.env.DB_HOST,
                DB_USERNAME: process.env.DB_USERNAME,
                DB_PASSWORD: process.env.DB_PASSWORD,
                DB_NAME: process.env.DB_NAME,
                DB_LOGGER: process.env.DB_LOGGER,
                JWT_SECRET: process.env.JWT_SECRET,
                DB_PORT: process.env.DB_PORT,
                CLIENT_URL: process.env.CLIENT_URL,
            },
            exec_mode: 'cluster',
            error_file: './',
        },
    ],
};
