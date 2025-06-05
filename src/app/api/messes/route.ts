import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Mess from "@/models/Mess";

// GET /api/messes - Get all messes
export async function GET() {
  try {
    await connectToDatabase();

    // Get all messes and populate with recent menu items if available
    const messes = await Mess.find({}).sort({ createdAt: -1 });

    // Map the messes to include today's menu items
    const messesWithMenu = messes.map((mess) => {
      const todayMenu =
        mess.menu && mess.menu.length > 0
          ? mess.menu[mess.menu.length - 1].items
          : [];

      return {
        id: mess._id,
        name: mess.name,
        type: mess.type,
        location: mess.location,
        address: mess.address,
        contactNumber: mess.contactNumber,
        description: mess.description,
        cuisine: mess.cuisine,
        image:
          mess.image ||
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80",
        todayMenu: todayMenu,
      };
    });

    return NextResponse.json({ messes: messesWithMenu }, { status: 200 });
  } catch (error) {
    console.error("Error fetching messes:", error);
    return NextResponse.json(
      { error: "Error fetching messes" },
      { status: 500 }
    );
  }
}
