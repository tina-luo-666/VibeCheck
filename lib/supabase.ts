import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to time database operations
export async function timedSupabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  logPrefix = "[DB]"
): Promise<T> {
  const startTime = Date.now();
  console.log(`${logPrefix} Starting ${operationName}...`);

  try {
    const result = await operation();
    const executionTime = Date.now() - startTime;
    console.log(
      `${logPrefix} ${operationName} completed in ${executionTime}ms`
    );
    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(
      `${logPrefix} ${operationName} failed after ${executionTime}ms:`,
      error
    );
    throw error;
  }
}
