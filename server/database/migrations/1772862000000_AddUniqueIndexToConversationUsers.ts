import type { Migration } from '..';

export const up: Migration = async function ({ context: queryInterface }) {
    await queryInterface.addIndex(
        'conversation_users',
        ['conversationId', 'userId'],
        {
            name: 'conversation_users_conversationId_userId_uniq',
            unique: true,
        }
    );
};

export const down: Migration = async function ({ context: queryInterface }) {
    await queryInterface.removeIndex(
        'conversation_users',
        'conversation_users_conversationId_userId_uniq'
    );
};

module.exports = { up, down };
