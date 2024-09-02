import { DataTypes } from 'sequelize';
import type { Migration } from '..';

export const up: Migration = async function ({ context: queryInterface }) {
    await queryInterface.createTable('user_profile', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            autoIncrement: false,
        },
        profileUrl: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        about: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        userId:{
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
    await queryInterface.addConstraint('user_profile', {
        fields: ['userId'],
        type: 'foreign key',
        references: {
            table: 'users',
            field: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'NO ACTION',
        name: 'user_profile_userId_fkey',
    });
};

export const down: Migration = async function ({ context: queryInterface }) {
    await queryInterface.dropTable('user_profile');
};

module.exports = { up, down };
