import { hash } from "bcrypt";
import { connectToDatabase } from "../lib/db";
import User from "../models/User";
import Mess from "../models/Mess";

async function seed() {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();

    console.log("Cleaning existing data...");
    await User.deleteMany({});
    await Mess.deleteMany({});

    console.log("Creating admin user...");
    const adminPassword = await hash("password123", 10);
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
    });

    console.log("Creating mess owner...");
    const messOwnerPassword = await hash("password123", 10);
    const messOwner = await User.create({
      name: "Mess Owner",
      email: "messowner@example.com",
      password: messOwnerPassword,
      role: "mess-owner",
    });

    console.log("Creating student...");
    const studentPassword = await hash("password123", 10);
    const student = await User.create({
      name: "Student User",
      email: "student@example.com",
      password: studentPassword,
      role: "student",
    });

    console.log("Creating mess...");
    await Mess.create({
      ownerId: messOwner._id,
      name: "Annapurna Mess",
      type: "veg",
      cuisine: ["North Indian", "South Indian"],
      location: "North Campus",
      address: "123, College Road, North Campus",
      contactNumber: "+91 9876543210",
      plans: [
        {
          name: "Basic",
          description: "Lunch only",
          price: 2000,
          duration: 30,
        },
        {
          name: "Standard",
          description: "Lunch and Dinner",
          price: 3500,
          duration: 30,
        },
        {
          name: "Premium",
          description: "Breakfast, Lunch and Dinner",
          price: 4500,
          duration: 30,
        },
      ],
      menu: [
        {
          date: new Date(),
          items: [
            { name: "Rice", type: "veg" },
            { name: "Dal", type: "veg" },
            { name: "Mixed Vegetables", type: "veg" },
            { name: "Chapati", type: "veg" },
            { name: "Curd", type: "veg" },
          ],
        },
      ],
    });

    console.log("Seed data created successfully!");
    console.log({
      admin: { email: admin.email, password: "password123" },
      messOwner: { email: messOwner.email, password: "password123" },
      student: { email: student.email, password: "password123" },
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seed();
