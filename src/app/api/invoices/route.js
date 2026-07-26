import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db, initDb } from "@/utils/db";

const DATA_FILE = path.join(process.cwd(), "invoices.json");

// Helper to read invoices from the JSON file (fallback)
function readInvoicesJson() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Error reading invoices file:", error);
    return [];
  }
}

// Helper to write invoices to the JSON file (fallback)
function writeInvoicesJson(invoices) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(invoices, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing invoices file:", error);
    return false;
  }
}

export async function GET(request) {
  const sellerHeader = request.headers.get("x-user-seller");
  
  if (!sellerHeader) {
    return NextResponse.json({ error: "Unauthorized: Missing authentication header" }, { status: 401 });
  }

  const isDbReady = await initDb();

  if (isDbReady && db) {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM invoices WHERE seller_name = ? ORDER BY created_at DESC",
        args: [sellerHeader]
      });
      
      const invoices = result.rows.map((row) => ({
        id: row.id,
        seller: {
          name: row.seller_name,
          address: row.seller_address,
          gstin: row.seller_gstin,
          state: row.seller_state,
          stateCode: row.seller_state_code,
        },
        buyer: {
          name: row.buyer_name,
          address: row.buyer_address,
          gstin: row.buyer_gstin,
          state: row.buyer_state,
          stateCode: row.buyer_state_code,
        },
        metadata: JSON.parse(row.metadata || "{}"),
        items: JSON.parse(row.items || "[]"),
        taxMode: row.tax_mode,
        wordsMode: row.words_mode,
        declaration: row.declaration,
        createdAt: row.created_at,
      }));

      return NextResponse.json(invoices);
    } catch (err) {
      console.error("Failed to query invoices from Turso, falling back to JSON:", err);
    }
  }

  // Fallback mode (filtered by seller)
  const invoices = readInvoicesJson();
  const filtered = invoices.filter((inv) => inv.seller?.name === sellerHeader);
  return NextResponse.json(filtered);
}

export async function POST(request) {
  try {
    const sellerHeader = request.headers.get("x-user-seller");
    
    if (!sellerHeader) {
      return NextResponse.json({ error: "Unauthorized: Missing authentication header" }, { status: 401 });
    }

    const newInvoice = await request.json();
    if (!newInvoice.id) {
      newInvoice.id = Date.now().toString();
    }
    
    if (!newInvoice.createdAt) {
      newInvoice.createdAt = new Date().toISOString();
    }

    // Force the invoice seller name to be the authenticated seller
    if (!newInvoice.seller) {
      newInvoice.seller = {};
    }
    newInvoice.seller.name = sellerHeader;

    const isDbReady = await initDb();

    if (isDbReady && db) {
      try {
        const metadataStr = JSON.stringify(newInvoice.metadata || {});
        const itemsStr = JSON.stringify(newInvoice.items || []);

        await db.execute({
          sql: `
            INSERT OR REPLACE INTO invoices (
              id, invoice_no, dated, 
              seller_name, seller_address, seller_gstin, seller_state, seller_state_code,
              buyer_name, buyer_address, buyer_gstin, buyer_state, buyer_state_code,
              metadata, items, tax_mode, words_mode, declaration, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            newInvoice.id,
            newInvoice.metadata?.invoiceNo || "",
            newInvoice.metadata?.dated || "",
            newInvoice.seller?.name || "",
            newInvoice.seller?.address || "",
            newInvoice.seller?.gstin || "",
            newInvoice.seller?.state || "",
            newInvoice.seller?.stateCode || "",
            newInvoice.buyer?.name || "",
            newInvoice.buyer?.address || "",
            newInvoice.buyer?.gstin || "",
            newInvoice.buyer?.state || "",
            newInvoice.buyer?.stateCode || "",
            metadataStr,
            itemsStr,
            newInvoice.taxMode || "",
            newInvoice.wordsMode || "",
            newInvoice.declaration || "",
            newInvoice.createdAt
          ]
        });

        return NextResponse.json(newInvoice);
      } catch (err) {
        console.error("Failed to write invoice to Turso, falling back to JSON:", err);
      }
    }

    // Fallback mode
    const invoices = readInvoicesJson();
    const existingIndex = invoices.findIndex((inv) => inv.id === newInvoice.id);

    // Authorization check in fallback mode
    if (existingIndex > -1 && invoices[existingIndex].seller?.name !== sellerHeader) {
      return NextResponse.json({ error: "Forbidden: Cannot edit another seller's invoice" }, { status: 403 });
    }

    if (existingIndex > -1) {
      invoices[existingIndex] = newInvoice;
    } else {
      invoices.push(newInvoice);
    }

    const success = writeInvoicesJson(invoices);
    if (!success) {
      return NextResponse.json({ error: "Failed to save invoice" }, { status: 500 });
    }

    return NextResponse.json(newInvoice);
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const sellerHeader = request.headers.get("x-user-seller");
    
    if (!sellerHeader) {
      return NextResponse.json({ error: "Unauthorized: Missing authentication header" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing invoice ID" }, { status: 400 });
    }

    const isDbReady = await initDb();

    if (isDbReady && db) {
      try {
        // Authorization check: Verify invoice owner before deletion
        const ownerCheck = await db.execute({
          sql: "SELECT seller_name FROM invoices WHERE id = ?",
          args: [id]
        });

        if (ownerCheck.rows.length === 0) {
          return NextResponse.json({ error: "Not Found: Invoice does not exist" }, { status: 444 });
        }

        if (ownerCheck.rows[0].seller_name !== sellerHeader) {
          return NextResponse.json({ error: "Forbidden: Cannot delete another seller's invoice" }, { status: 403 });
        }

        await db.execute({
          sql: "DELETE FROM invoices WHERE id = ?",
          args: [id]
        });
        return NextResponse.json({ success: true, message: "Invoice deleted from Turso" });
      } catch (err) {
        console.error("Failed to delete invoice from Turso, falling back to JSON:", err);
      }
    }

    // Fallback mode
    const invoices = readInvoicesJson();
    const invoiceIndex = invoices.findIndex((inv) => inv.id === id);

    if (invoiceIndex === -1) {
      return NextResponse.json({ error: "Not Found: Invoice does not exist" }, { status: 444 });
    }

    if (invoices[invoiceIndex].seller?.name !== sellerHeader) {
      return NextResponse.json({ error: "Forbidden: Cannot delete another seller's invoice" }, { status: 403 });
    }

    const filtered = invoices.filter((inv) => inv.id !== id);
    const success = writeInvoicesJson(filtered);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete invoice from JSON file" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Invoice deleted from JSON file" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: "Server deletion error" }, { status: 500 });
  }
}
