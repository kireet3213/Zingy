import { DataTypes } from 'sequelize';
import type { Migration } from '..';

export const up: Migration = async function ({ context: queryInterface }) {
    await queryInterface.createTable('users', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    });
};

export const down: Migration = async function ({ context: queryInterface }) {
    await queryInterface.dropTable('users');
};

module.exports = { up, down };
