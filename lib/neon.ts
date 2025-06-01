import { neon, neonConfig } from "@neondatabase/serverless";

// Configure neon to use fetch from the global scope (important for Next.js)
neonConfig.fetchConnectionCache = true;

// Get the SQL executor
const sql = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : () => {
      throw new Error("DATABASE_URL environment variable is not set");
    };

/**
 * Execute a SQL query with parameters
 * @example
 * // Simple query
 * const users = await query`SELECT * FROM users WHERE active = ${true}`;
 *
 * // With multiple parameters
 * const user = await query`SELECT * FROM users WHERE id = ${userId} AND email = ${email}`;
 */
export async function query<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T[]> {
  return sql(strings, ...values) as Promise<T[]>;
}

/**
 * Execute a SQL query and return the first result or null
 */
export async function queryFirst<T = any>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T | null> {
  const results = (await sql(strings, ...values)) as T[];
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute a SQL query that doesn't return results (INSERT, UPDATE, DELETE)
 */
export async function execute(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<void> {
  await sql(strings, ...values);
}

// For direct access to the neon SQL function
export { sql };
