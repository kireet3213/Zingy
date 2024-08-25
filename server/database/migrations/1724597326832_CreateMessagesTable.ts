import { DataTypes } from 'sequelize';
import type { Migration } from '..';

export const up: Migration = async function ({ context: queryInterface }) {
    await queryInterface.createTable('messages', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            autoIncrement: false,
            defaultValue: DataTypes.UUIDV4,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        reaction: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        readAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        //self referencing
        replyId: {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null,
        },
        conversationId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
        },
        senderId: {
            type: DataTypes.UUID,
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

    await queryInterface.addConstraint('messages', {
        fields: ['replyId'],
        type: 'foreign key',
        references: {
            table: 'messages',
            field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'messages_replyId_fkey',
    });
    await queryInterface.addConstraint('messages', {
        fields: ['conversationId'],
        type: 'foreign key',
        references: {
            table: 'conversations',
            field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
        name: 'messages_conversationId_fkey',
    });
    await queryInterface.addConstraint('messages', {
        fields: ['senderId'],
        type: 'foreign key',
        references: {
            table: 'users',
            field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
        name: 'messages_senderId_fkey',
    });
};

export const down: Migration = async function ({ context: queryInterface }) {
    await queryInterface.dropTable('messages');
};

module.exports = { up, down };
