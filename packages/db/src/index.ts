import { neon, types } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

// drizzle's neon-http driver registers these "keep the raw string" parsers on the
// @neondatabase/serverless instance it imports. The production bundle can end up
// with a second copy of that package (the one used to create our client), which
// would then parse `date` columns into Date objects. Register them on our own
// instance too, so dates stay strings everywhere.
const RAW_STRING_TYPE_IDS = [
  1184, // timestamptz
  1114, // timestamp
  1082, // date
  1186, // interval
  1231, // numeric[]
  1115, // timestamp[]
  1185, // timestamptz[]
  1187, // interval[]
  1182, // date[]
];
for (const typeId of RAW_STRING_TYPE_IDS) {
  types.setTypeParser(typeId, (value: string) => value);
}

export function createDb(env: DatabaseConfig) {
  const sql = neon(env.DATABASE_URL);
  return drizzle({ client: sql, relations });
}

export type Database = ReturnType<typeof createDb>;

export * from "./schema";
