import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Initialize db client only if configuration is present
export const db = url ? createClient({ url, authToken }) : null;

let isDbInitialized = false;

export async function initDb() {
  if (!db) {
    console.log("No Turso Database URL found. Running in local JSON database mode.");
    return false;
  }

  if (isDbInitialized) {
    return true;
  }

  try {
    // 1. Create invoices table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        invoice_no TEXT,
        dated TEXT,
        seller_name TEXT,
        seller_address TEXT,
        seller_gstin TEXT,
        seller_state TEXT,
        seller_state_code TEXT,
        buyer_name TEXT,
        buyer_address TEXT,
        buyer_gstin TEXT,
        buyer_state TEXT,
        buyer_state_code TEXT,
        metadata TEXT, -- stores JSON string of extra fields (vehicle, dispatch doc, etc.)
        items TEXT, -- stores JSON string of items array
        tax_mode TEXT,
        words_mode TEXT,
        declaration TEXT,
        created_at TEXT
      )
    `);
    
    // 2. Create users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        username TEXT PRIMARY KEY,
        password TEXT,
        seller_name TEXT
      )
    `);

    // 3. Create customers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT,
        address TEXT,
        gstin TEXT,
        state TEXT,
        state_code TEXT,
        seller_name TEXT
      )
    `);

    // 4. Seed default users if empty
    const usersCount = await db.execute("SELECT COUNT(*) as count FROM users");
    const count = usersCount.rows[0]?.count || 0;
    
    if (count === 0) {
      console.log("Seeding default users into 'users' table...");
      await db.execute({
        sql: "INSERT INTO users (username, password, seller_name) VALUES (?, ?, ?)",
        args: ["prem", "password123", "PREM ENTERPRISES"]
      });
      await db.execute({
        sql: "INSERT INTO users (username, password, seller_name) VALUES (?, ?, ?)",
        args: ["sridevi", "password123", "SRIDEVI ENTERPRISES"]
      });
      console.log("Seeding complete.");
    }

    // 5. Seed default preset customers if empty
    const customersCount = await db.execute("SELECT COUNT(*) as count FROM customers");
    const cCount = customersCount.rows[0]?.count || 0;

    if (cCount === 0) {
      console.log("Seeding default customers into 'customers' table...");
      const defaultPresets = [
        { name: "SWAN AGRI PRODUCTS PVT.LTD.", address: "R-81 MIDC TTC Industrial Area,Ear Golde Garrage,\nRaale,Navi Mumbai,022-2690998/277695455", gstin: "27AAICS9978C1ZR", state: "Maharashtra", stateCode: "27" },
        { name: "PREM ENTERPRISES", address: "PROP : SHRIRAM ETHIRAJ GROUND FLOOR, PLOT NO.G/26,\nCLASSIC INDUSTRIES, NEAR KAMAN VILLAGE, POMAN,\nVASAI EAST, MUMBAI - 401208", gstin: "27AAEPE2223R2ZM", state: "Maharashtra", stateCode: "27" },
        { name: "MAHARAJA FARASAN", address: "B/2 80 Anna Nagar,Cross Road Dharavi,\nMumbai", gstin: "27ACVPN5208J1Z2", state: "Maharashtra", stateCode: "27" },
        { name: "M J ENTERPRISES", address: "526, 5th Floor A Wing, Princ Park\nRajdeep CHS Near PMGP Colony\nDharavi Mumbai - 400017", gstin: "27AGBPJ3363Q1Z0", state: "Maharashtra", stateCode: "27" },
        { name: "BHAKTI FOODS", address: "Gala No 4,Sagha Pada,\nD.E. Estate, Opp, Kaman Road,Chinchoti,\nVasai,Dist-Palghar", gstin: "27AJPPA1854Q1ZO", state: "Maharashtra", stateCode: "27" },
        { name: "SRIDEVI ENTERPRISES", address: "Grd Floor,Bulding No/flat No-1642 Satyam CHS,Sant\nRohidas Marg, Mukund Nagar,Dharavi,Mumbai 400017", gstin: "27AFCPE5975R1ZQ", state: "Maharashtra", stateCode: "27" }
      ];

      let idx = 0;
      for (const cust of defaultPresets) {
        // Seed for PREM ENTERPRISES
        await db.execute({
          sql: "INSERT INTO customers (id, name, address, gstin, state, state_code, seller_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
          args: [`preset-prem-${idx}`, cust.name, cust.address, cust.gstin, cust.state, cust.stateCode, "PREM ENTERPRISES"]
        });
        // Seed for SRIDEVI ENTERPRISES
        await db.execute({
          sql: "INSERT INTO customers (id, name, address, gstin, state, state_code, seller_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
          args: [`preset-sridevi-${idx}`, cust.name, cust.address, cust.gstin, cust.state, cust.stateCode, "SRIDEVI ENTERPRISES"]
        });
        idx++;
      }
      console.log("Seeding customers complete.");
    }

    console.log("Turso Database initialized successfully. Tables are ready.");
    isDbInitialized = true;
    return true;
  } catch (err) {
    console.error("Failed to initialize Turso database tables:", err);
    return false;
  }
}
