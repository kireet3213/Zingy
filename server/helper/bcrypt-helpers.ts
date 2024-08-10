import * as bcrypt from 'bcrypt';

const saltRounds = 10;

export async function getHashedPassword(password: string) {
    const salt = await bcrypt.genSalt(saltRounds);

    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
}

export function comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
}
