import connection from "../../configuration/database/database.config";


async function deleteAllData() {
    console.log(Object.keys(connection.models));
    for(let model of Object.keys(connection.models)) {
        await connection.models[model].destroy({where:{}, cascade: true});
    }

}
deleteAllData();