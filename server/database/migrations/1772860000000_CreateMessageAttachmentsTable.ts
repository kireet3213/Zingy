import { DataTypes } from 'sequelize';
import type { Migration } from '..';

export const up: Migration = async function ({ context: queryInterface }) {
    await queryInterface.createTable('message_attachments', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            autoIncrement: false,
            defaultValue: DataTypes.UUIDV4,
        },
        messageId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        fileUrl: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        fileName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        mimeType: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
        },
        sizeBytes: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: true,
            defaultValue: null,
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

    await queryInterface.addConstraint('message_attachments', {
        fields: ['messageId'],
        type: 'foreign key',
        references: {
            table: 'messages',
            field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'message_attachments_messageId_fkey',
    });

    await queryInterface.addIndex('messages', ['conversationId', 'createdAt'], {
        name: 'messages_conversationId_createdAt_idx',
    });

    await queryInterface.addIndex('messages', ['replyId'], {
        name: 'messages_replyId_idx',
    });

    await queryInterface.addIndex('message_attachments', ['messageId'], {
        name: 'message_attachments_messageId_idx',
    });
};

export const down: Migration = async function ({ context: queryInterface }) {
    await queryInterface.removeIndex(
        'message_attachments',
        'message_attachments_messageId_idx'
    );
    await queryInterface.removeIndex('messages', 'messages_replyId_idx');
    await queryInterface.removeIndex(
        'messages',
        'messages_conversationId_createdAt_idx'
    );
    await queryInterface.dropTable('message_attachments');
};

module.exports = { up, down };
