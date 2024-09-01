/* eslint-disable no-console */
import connection from '../../configuration/database/database.config';
import { seedUsers } from '../seeders/seed-users';

connection
    .authenticate()
    .then(async () => {
        await connection.sync({ force: false });
        console.log('Database successfully connected');
    })
    .catch((err) => {
        console.log('Error', err);
    });

if (!process.argv[0] || !process.argv[1]) {
    throw new Error('Please specify correct seed command');
}

if (process.argv[2] === '--seedUsers') {
    seedUsers();
    console.log(`\x1b[34m Seeded mock users \x1b[0m`);
}
