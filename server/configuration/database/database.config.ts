import path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../../.env') });
import { Sequelize } from 'sequelize-typescript';
import { User } from '../../database/models/user.model';
import { Dialect } from 'sequelize';
import { Conversation } from '../../database/models/conversation.model';
import { ConversationUser } from '../../database/models/conversationUser.model';
import { Message } from '../../database/models/message.model';
import { UserProfile } from '../../database/models/userProfile.model';

const connection = new Sequelize({
    dialect: (process.env.DB_DIALECT || 'mysql') as Dialect,
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'sample_sequelize',
    logging: (query) => {
        return process.env.DB_LOGGER === 'true'
            ? // eslint-disable-next-line no-console
              console.log('\x1b[35m%s\x1b[0m', query)
            : undefined;
    },
    models: [User, Conversation, ConversationUser, Message, UserProfile],
    port: (process.env.DB_PORT || 3306) as number,
});

export default connection;
