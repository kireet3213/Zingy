import { faker } from '@faker-js/faker';
import fs from 'fs';
import { resolve } from 'node:path';

function generateUser(i: number) {
    const name =
        faker.internet.displayName().toLowerCase().replace(' ', '') + i;
    const email = `${name}@${faker.internet.domainName()}`.toLowerCase();
    const password = faker.internet.password({
        length: 10,
        memorable: true,
        pattern: new RegExp('([A-Z])([a-z])([0-9])(!@#$%^&*()_+)'),
    });
    const about = faker.lorem.sentence({ min: 10, max: 20 });
    return {
        username: name,
        email: email,
        password: password,
        userProfile: {
            about: about,
            profileUrl: faker.image.urlPicsumPhotos({
                width: 200,
                height: 200,
                blur: 0,
                grayscale: false,
            }),
        },
    };
}

function generateUsers(numUsers: number) {
    const users = [];
    for (let i = 0; i < numUsers; i++) {
        users.push(generateUser(i));
    }
    return users;
}

const numUsers = 1000;
const usersData = generateUsers(numUsers);

const jsonFilePath = resolve(__dirname, 'users.ts');

fs.writeFileSync(jsonFilePath, JSON.stringify(usersData, null, 4));
