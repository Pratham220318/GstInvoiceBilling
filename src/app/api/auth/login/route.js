import { NextResponse } from "next/server";
import { db, initDb } from "@/utils/db";

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }

    const isDbReady = await initDb();

    // 1. Database auth route
    if (isDbReady && db) {
      try {
        const result = await db.execute({
          sql: "SELECT * FROM users WHERE username = ? AND password = ?",
          args: [username.toLowerCase().trim(), password]
        });

        if (result.rows.length > 0) {
          const userRow = result.rows[0];
          return NextResponse.json({
            success: true,
            user: {
              username: userRow.username,
              sellerName: userRow.seller_name
            }
          });
        } else {
          return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
        }
      } catch (err) {
        console.error("Database query failed during login, trying fallback:", err);
      }
    }

    // 2. Local Fallback authentication
    const userLower = username.toLowerCase().trim();
    if (userLower === "prem" && password === "password123") {
      return NextResponse.json({
        success: true,
        user: {
          username: "prem",
          sellerName: "PREM ENTERPRISES"
        }
      });
    } else if (userLower === "sridevi" && password === "password123") {
      return NextResponse.json({
        success: true,
        user: {
          username: "sridevi",
          sellerName: "SRIDEVI ENTERPRISES"
        }
      });
    }

    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  } catch (error) {
    console.error("Auth API error:", error);
    return NextResponse.json({ error: "Server authentication error" }, { status: 500 });
  }
}
