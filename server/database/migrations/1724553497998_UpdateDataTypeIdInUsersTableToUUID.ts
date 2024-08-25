import { DataTypes } from 'sequelize';
import type { Migration } from '..';

export const up: Migration = async function ({ context: queryInterface }) {
    await queryInterface.changeColumn('users', 'id', {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        autoIncrement: false,
    });
};

export const down: Migration = async function ({ context: queryInterface }) {
    await queryInterface.changeColumn('users', 'id', {
        type: DataTypes.BIGINT,
        autoIncrement: true,
    });
};

module.exports = { up, down };
