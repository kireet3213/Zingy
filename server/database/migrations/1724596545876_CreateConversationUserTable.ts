import { DataTypes } from 'sequelize';
import type { Migration } from '..';

export const up: Migration = async function ({ context: queryInterface }) {
    await queryInterface.createTable(
        'conversation_users',
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            conversationId: {
                type: DataTypes.BIGINT.UNSIGNED,
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
        },
        {}
    );

    await queryInterface.addConstraint('conversation_users', {
        fields: ['userId'],
        references: {
            field: 'id',
            table: 'users',
        },
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
        type: 'foreign key',
        name: 'conversations_userId_fkey',
    });

    await queryInterface.addConstraint('conversation_users', {
        fields: ['conversationId'],
        references: {
            field: 'id',
            table: 'conversations',
        },
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
        type: 'foreign key',
        name: 'conversations_conversationId_fkey',
    });
};

export const down: Migration = async function ({ context: queryInterface }) {
    await queryInterface.dropTable('conversation_users');
};

module.exports = { up, down };
