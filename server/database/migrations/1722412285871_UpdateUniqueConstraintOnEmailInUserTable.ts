import type { Migration } from '..';

export const up: Migration = async function ({ context: queryInterface }) {
    await queryInterface.addConstraint('users', {
        type: 'unique',
        fields: ['email'],
        name: 'users_email_unique',
    });
};

export const down: Migration = async function ({ context: queryInterface }) {
    await queryInterface.removeConstraint('users', 'users_email_unique');
};

module.exports = { up, down };
