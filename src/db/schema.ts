
import {
  boolean,
  decimal,
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Enums
export const adviceSourceStatus = pgEnum("advice_source_status", [
  "pending",
  "chapterized",
  "analyzed",
]);
export const transactionSource = pgEnum("transaction_source", [
  "TradeStation",
  "Manual",
]);
export const transactionStatus = pgEnum("transaction_status", [
  "Open",
  "Closed",
]);
export const watchedItemStatus = pgEnum("watched_item_status", [
  "Watching",
  "Triggered",
]);

// Tables
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  authId: varchar("auth_id", { length: 255 }).notNull().unique(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  tradeStationRefreshToken: text("tradestation_refresh_token").notNull(),
});

export const adviceSources = pgTable("advice_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  isbn: varchar("isbn", { length: 20 }),
  coverUrl: text("cover_url"),
  pdfPath: text("pdf_path"),
  processingStatus: adviceSourceStatus("processing_status")
    .notNull()
    .default("pending"),
});

export const sourceChapters = pgTable("source_chapters", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => adviceSources.id),
  chapterNumber: integer("chapter_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  contentText: text("content_text").notNull(),
});

export const strategies = pgTable("strategies", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => adviceSources.id),
  name: varchar("name", { length: 255 }).notNull(),
  rules: json("rules"),
  easyLanguageCode: text("easylanguage_code"),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  source: transactionSource("source").notNull(),
  isPaperTrade: boolean("is_paper_trade").notNull().default(false),
  ticker: varchar("ticker", { length: 50 }).notNull(),
  strategyId: uuid("strategy_id").references(() => strategies.id),
  tsOrderId: varchar("ts_order_id", { length: 255 }),
  entryDate: timestamp("entry_date").notNull(),
  exitDate: timestamp("exit_date"),
  entryPrice: decimal("entry_price", { precision: 10, scale: 2 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 10, scale: 2 }),
  quantity: integer("quantity").notNull(),
  pnl: decimal("pnl", { precision: 10, scale: 2 }),
  status: transactionStatus("status").notNull(),
  notes: text("notes"),
});

export const watchedItems = pgTable("watched_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticker: varchar("ticker", { length: 50 }).notNull(),
  strategyId: uuid("strategy_id").references(() => strategies.id),
  status: watchedItemStatus("status").notNull().default("Watching"),
});
