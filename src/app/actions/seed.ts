
'use server';

import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "../../db/schema";
import { transactions, users } from "../../db/schema";

const db = drizzle(sql, { schema });

export async function seed() {
  const startTime = Date.now();

  await db.delete(transactions);
  await db.delete(users);

  const newUser = await db
    .insert(users)
    .values({
      authId: "seed-user",
    })
    .returning({ id: users.id });

  const userId = newUser[0].id;

  const newTransactions = await db
    .insert(transactions)
    .values([
      {
        userId: userId,
        source: "TradeStation",
        isPaperTrade: true,
        ticker: "AAPL",
        entryDate: new Date(),
        entryPrice: "150.00",
        quantity: 10,
        status: "Open",
      },
      {
        userId: userId,
        source: "Manual",
        isPaperTrade: false,
        ticker: "GOOGL",
        entryDate: new Date(),
        entryPrice: "2800.00",
        quantity: 5,
        status: "Open",
      },
    ])
    .returning();

  console.log(`Seeded ${newTransactions.length} transactions`);

  const duration = Date.now() - startTime;
  console.log(`Seeding completed in ${duration}ms`);
}

seed();
