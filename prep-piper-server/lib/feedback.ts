// lib/feedback.ts
import {db} from './db';

export async function getUserFeedback(userId: string) {
  return db.userFeedback.findUnique({ where: { userId } });
}

export async function upsertFeedback(userId: string, rating: number, comments?: string) {
  return db.userFeedback.upsert({
    where: { userId },
    update: { rating, comments },
    create: { userId, rating, comments },
  });
}
