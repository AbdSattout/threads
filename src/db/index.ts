import * as schema from "@/db/schema";
import { env } from "@/env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const db = drizzle({ client: neon(env.DATABASE_URL), schema });

export default db;