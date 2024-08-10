import { validateOrReject } from 'class-validator';

export async function validateOrRejectSchema(input: unknown): Promise<void> {
    await validateOrReject(input as object, { whitelist: true });
}
