import type { Migration } from '..';

export const up: Migration = async function ({ context: queryInterface }) {
    await queryInterface.addConstraint('users', {
        type: 'unique',
        fields: ['email'],
    });
};

export const down: Migration = async function ({ context: queryInterface }) {
    await queryInterface.dropTable('table_name');
};

module.exports = { up, down };
