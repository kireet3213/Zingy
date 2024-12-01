import { DataTypes } from 'sequelize';
import type { Migration } from '..';

export const up: Migration = async function ({ context: queryInterface }) {
    await queryInterface.changeColumn('users', 'name', {
        unique: true,
        type: DataTypes.STRING,
    });

    await queryInterface.renameColumn('users', 'name', 'username');
};

export const down: Migration = async function ({ context: queryInterface }) {
    await queryInterface.changeColumn('users', 'username', {
        unique: false,
        type: DataTypes.STRING,
    });
    await queryInterface.renameColumn('users', 'username', 'name');
};

module.exports = { up, down };
