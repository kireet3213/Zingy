/* eslint-disable */
const path = require('node:path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = {
    apps: [
        {
            name: 'zingy',
            script: 'dist/app.js',
            watch: ['dist'],
            ignore_watch: ['node_modules', 'logs', '.git'],
            instances: '1', 
            exec_mode: 'fork',
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            env: {
                NODE_ENV: 'development',
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
        },
    ],
};
