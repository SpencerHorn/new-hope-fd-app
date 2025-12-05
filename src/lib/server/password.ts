// src/lib/server/password.ts
import { Argon2id } from 'oslo/password';

const hasher = new Argon2id();

export const hashPassword = (password: string) => hasher.hash(password);
export const verifyPassword = (hash: string, password: string) => hasher.verify(hash, password);
