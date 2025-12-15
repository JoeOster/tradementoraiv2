
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from '../db/schema';

export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

export type ApiKey = InferSelectModel<typeof schema.apiKeys>;
export type NewApiKey = InferInsertModel<typeof schema.apiKeys>;

export type AdviceSource = InferSelectModel<typeof schema.adviceSources>;
export type NewAdviceSource = InferInsertModel<typeof schema.adviceSources>;

export type SourceChapter = InferSelectModel<typeof schema.sourceChapters>;
export type NewSourceChapter = InferInsertModel<typeof schema.sourceChapters>;

export type Strategy = InferSelectModel<typeof schema.strategies>;
export type NewStrategy = InferInsertModel<typeof schema.strategies>;

export type Transaction = InferSelectModel<typeof schema.transactions>;
export type NewTransaction = InferInsertModel<typeof schema.transactions>;

export type WatchedItem = InferSelectModel<typeof schema.watchedItems>;
export type NewWatchedItem = InferInsertModel<typeof schema.watchedItems>;
