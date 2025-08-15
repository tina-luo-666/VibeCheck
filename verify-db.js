const { createClient } = require("@supabase/supabase-js");

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabase() {
  console.log("🔍 Verifying database setup...\n");

  const tables = ["users", "stores", "products", "orders", "generations"];
  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error && error.code === "PGRST205") {
        console.log(`❌ Table '${table}' does not exist`);
        allTablesExist = false;
      } else if (error) {
        console.log(
          `⚠️  Table '${table}' exists but has an error:`,
          error.message
        );
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    } catch (err) {
      console.log(`❌ Error checking table '${table}':`, err.message);
      allTablesExist = false;
    }
  }

  console.log("\n" + "=".repeat(50));
  if (allTablesExist) {
    console.log("🎉 SUCCESS! All database tables are set up correctly.");
    console.log(
      "Your application should now work without the schema cache error."
    );
  } else {
    console.log("❌ Database setup incomplete.");
    console.log("Please follow the instructions in SETUP_DATABASE.md");
  }
  console.log("=".repeat(50));
}

verifyDatabase();
