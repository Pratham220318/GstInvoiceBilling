import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "invoices.json");

// Helper to read invoices from the JSON file
function readInvoices() {
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

// Helper to write invoices to the JSON file
function writeInvoices(invoices) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(invoices, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing invoices file:", error);
    return false;
  }
}

export async function GET() {
  const invoices = readInvoices();
  return NextResponse.json(invoices);
}

export async function POST(request) {
  try {
    const newInvoice = await request.json();
    if (!newInvoice.id) {
      newInvoice.id = Date.now().toString();
    }
    
    // Add timestamp if not exists
    if (!newInvoice.createdAt) {
      newInvoice.createdAt = new Date().toISOString();
    }

    const invoices = readInvoices();
    const existingIndex = invoices.findIndex((inv) => inv.id === newInvoice.id);

    if (existingIndex > -1) {
      invoices[existingIndex] = newInvoice; // Update existing
    } else {
      invoices.push(newInvoice); // Add new
    }

    const success = writeInvoices(invoices);
    if (!success) {
      return NextResponse.json({ error: "Failed to save invoice" }, { status: 500 });
    }

    return NextResponse.json(newInvoice);
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }
}
