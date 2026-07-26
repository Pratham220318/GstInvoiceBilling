import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db, initDb } from "@/utils/db";

const CUSTOMERS_FILE = path.join(process.cwd(), "customers.json");

// Helper to read customers from the JSON file (fallback)
function readCustomersJson() {
  try {
    if (!fs.existsSync(CUSTOMERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(CUSTOMERS_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Error reading customers JSON:", error);
    return [];
  }
}

// Helper to write customers to the JSON file (fallback)
function writeCustomersJson(customers) {
  try {
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing customers JSON:", error);
    return false;
  }
}

// Default presets list if fallback file is empty
const DEFAULT_PRESETS = [
  { name: "SWAN AGRI PRODUCTS PVT.LTD.", address: "R-81 MIDC TTC Industrial Area,Ear Golde Garrage,\nRaale,Navi Mumbai,022-2690998/277695455", gstin: "27AAICS9978C1ZR", state: "Maharashtra", stateCode: "27" },
  { name: "PREM ENTERPRISES", address: "PROP : SHRIRAM ETHIRAJ GROUND FLOOR, PLOT NO.G/26,\nCLASSIC INDUSTRIES, NEAR KAMAN VILLAGE, POMAN,\nVASAI EAST, MUMBAI - 401208", gstin: "27AAEPE2223R2ZM", state: "Maharashtra", stateCode: "27" },
  { name: "MAHARAJA FARASAN", address: "B/2 80 Anna Nagar,Cross Road Dharavi,\nMumbai", gstin: "27ACVPN5208J1Z2", state: "Maharashtra", stateCode: "27" },
  { name: "M J ENTERPRISES", address: "526, 5th Floor A Wing, Princ Park\nRajdeep CHS Near PMGP Colony\nDharavi Mumbai - 400017", gstin: "27AGBPJ3363Q1Z0", state: "Maharashtra", stateCode: "27" },
  { name: "BHAKTI FOODS", address: "Gala No 4,Sagha Pada,\nD.E. Estate, Opp, Kaman Road,Chinchoti,\nVasai,Dist-Palghar", gstin: "27AJPPA1854Q1ZO", state: "Maharashtra", stateCode: "27" },
  { name: "SRIDEVI ENTERPRISES", address: "Grd Floor,Bulding No/flat No-1642 Satyam CHS,Sant\nRohidas Marg, Mukund Nagar,Dharavi,Mumbai 400017", gstin: "27AFCPE5975R1ZQ", state: "Maharashtra", stateCode: "27" }
];

export async function GET(request) {
  const sellerHeader = request.headers.get("x-user-seller");

  if (!sellerHeader) {
    return NextResponse.json({ error: "Unauthorized: Missing authentication header" }, { status: 401 });
  }

  const isDbReady = await initDb();

  if (isDbReady && db) {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM customers WHERE seller_name = ? ORDER BY name ASC",
        args: [sellerHeader]
      });

      const customers = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        address: row.address,
        gstin: row.gstin,
        state: row.state,
        stateCode: row.state_code,
      }));

      return NextResponse.json(customers);
    } catch (err) {
      console.error("Failed to query customers from Turso, falling back to JSON:", err);
    }
  }

  // Fallback mode
  const localCusts = readCustomersJson();
  const filtered = localCusts.filter((c) => c.sellerName === sellerHeader);

  // If no local customers exist yet, append default presets as initial list
  if (filtered.length === 0) {
    const formattedPresets = DEFAULT_PRESETS.map((p, idx) => ({
      id: `fallback-preset-${idx}`,
      name: p.name,
      address: p.address,
      gstin: p.gstin,
      state: p.state,
      stateCode: p.stateCode,
      sellerName: sellerHeader
    }));
    return NextResponse.json(formattedPresets);
  }

  return NextResponse.json(filtered);
}

export async function POST(request) {
  try {
    const sellerHeader = request.headers.get("x-user-seller");

    if (!sellerHeader) {
      return NextResponse.json({ error: "Unauthorized: Missing authentication header" }, { status: 401 });
    }

    const customerData = await request.json();
    if (!customerData.name) {
      return NextResponse.json({ error: "Missing customer name" }, { status: 400 });
    }

    if (!customerData.id) {
      customerData.id = "cust_" + Date.now().toString();
    }

    const isDbReady = await initDb();

    if (isDbReady && db) {
      try {
        await db.execute({
          sql: `
            INSERT OR REPLACE INTO customers (
              id, name, address, gstin, state, state_code, seller_name
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            customerData.id,
            customerData.name,
            customerData.address || "",
            customerData.gstin || "",
            customerData.state || "",
            customerData.stateCode || "",
            sellerHeader
          ]
        });

        return NextResponse.json(customerData);
      } catch (err) {
        console.error("Failed to insert customer into Turso, falling back to JSON:", err);
      }
    }

    // Fallback mode
    const customers = readCustomersJson();
    const existingIndex = customers.findIndex((c) => c.id === customerData.id);

    const newCust = {
      id: customerData.id,
      name: customerData.name,
      address: customerData.address || "",
      gstin: customerData.gstin || "",
      state: customerData.state || "",
      stateCode: customerData.stateCode || "",
      sellerName: sellerHeader
    };

    if (existingIndex > -1) {
      customers[existingIndex] = newCust;
    } else {
      customers.push(newCust);
    }

    const success = writeCustomersJson(customers);
    if (!success) {
      return NextResponse.json({ error: "Failed to save customer to JSON file" }, { status: 500 });
    }

    return NextResponse.json(newCust);
  } catch (error) {
    console.error("Customer POST error:", error);
    return NextResponse.json({ error: "Invalid customer data" }, { status: 400 });
  }
}
