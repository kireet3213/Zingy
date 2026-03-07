import { DataTypes } from 'sequelize';
import type { Migration } from '..';

export const up: Migration = async function ({ context: queryInterface }) {
    const table = await queryInterface.describeTable('messages');
    if ('reaction' in table) {
        await queryInterface.removeColumn('messages', 'reaction');
    }
};

export const down: Migration = async function ({ context: queryInterface }) {
    const table = await queryInterface.describeTable('messages');
    if (!('reaction' in table)) {
        await queryInterface.addColumn('messages', 'reaction', {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        });
    }
};

module.exports = { up, down };
