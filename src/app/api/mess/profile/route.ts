import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth-options";
import Mess from "@/models/Mess";
import User from "@/models/User";

// GET /api/mess/profile - Get the mess profile for the logged-in mess owner
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.user.role !== "mess-owner") {
      return NextResponse.json(
        { error: "Only mess owners can access this endpoint" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Find mess by owner ID
    const mess = await Mess.findOne({ ownerId: session.user.id });

    if (!mess) {
      return NextResponse.json(
        { error: "Mess profile not found", redirectToSetup: true },
        { status: 404 }
      );
    }

    return NextResponse.json({ mess }, { status: 200 });
  } catch (error) {
    console.error("Error fetching mess profile:", error);
    return NextResponse.json(
      { error: "Error fetching mess profile" },
      { status: 500 }
    );
  }
}

// PUT /api/mess/profile - Update the mess profile for the logged-in mess owner
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.user.id);

    if (!user || user.role !== "mess-owner") {
      return Response.json(
        { error: "Only mess owners can update profiles" },
        { status: 403 }
      );
    }

    const {
      name,
      type,
      cuisine,
      location,
      address,
      contactNumber,
      description,
      plans,
      menu,
    } = await request.json();

    if (!name || !location || !address) {
      return Response.json(
        { error: "Name, location, and address are required" },
        { status: 400 }
      );
    }

    // Check if the mess profile already exists
    let mess = await Mess.findOne({ ownerId: user._id });

    if (mess) {
      // Update existing mess
      mess.name = name;
      mess.type = type;
      mess.cuisine = cuisine;
      mess.location = location;
      mess.address = address;
      mess.contactNumber = contactNumber;
      mess.description = description;

      // Update plans if provided
      if (plans) {
        mess.plans = plans;
      }

      // Update menu if provided
      if (menu) {
        mess.menu = menu;
      }

      await mess.save();
    } else {
      // Create new mess
      mess = new Mess({
        ownerId: user._id,
        name,
        type,
        cuisine,
        location,
        address,
        contactNumber,
        description,
        plans: plans || [],
        menu: menu || [],
      });

      await mess.save();
    }

    return Response.json({ success: true, mess });
  } catch (error) {
    console.error("Error updating mess profile:", error);
    return Response.json(
      { error: "Error updating mess profile" },
      { status: 500 }
    );
  }
}
