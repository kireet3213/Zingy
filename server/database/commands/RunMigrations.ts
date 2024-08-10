/* eslint-disable no-console */
import { MigrateDownOptions } from 'umzug';
import { umzug } from '..';

const command = process.argv[2];

if (command === '--runAll') {
    runAllMigrations();
}
if (command === '--deleteAll') {
    dropAllTables({ to: 0 });
}
if (command === '--revert') {
    dropAllTables({});
}

async function runAllMigrations() {
    console.log(`\x1b[34m Running all pending migrations \x1b[0m`);
    const migrations = await umzug.up().catch((err) => console.log(err));
    console.log(
        `\x1b[34m ${JSON.stringify(migrations?.map((file) => file.name))} \x1b[0m`
    );
}

async function dropAllTables(options: MigrateDownOptions) {
    console.log(`\x1b[34m Dropping tables \x1b[0m`);
    const deleted = await umzug.down(options);
    console.log(
        `\x1b[34m ${JSON.stringify(deleted.map((file) => file.name))} \x1b[0m`
    );
}
