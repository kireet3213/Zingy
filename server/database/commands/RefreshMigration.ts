import connection from '../../configuration/database/database.config';

async function deleteAllData() {
    for (const model of Object.keys(connection.models)) {
        await connection.models[model].destroy({ where: {}, cascade: true });
    }
}
deleteAllData();
