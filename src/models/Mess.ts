import mongoose, { Schema, Document } from "mongoose";

interface MenuItem {
  name: string;
  description?: string;
  type: "veg" | "non-veg";
  image?: string;
}

interface MenuForDate {
  date: Date;
  items: MenuItem[];
}

interface SubscriptionPlan {
  name: string;
  description: string;
  price: number;
  duration: number; // in days
}

export interface IMess extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  type: "veg" | "non-veg" | "both";
  cuisine: string[];
  location: string;
  address: string;
  contactNumber: string;
  image?: string;
  description?: string;
  plans: SubscriptionPlan[];
  menu: MenuForDate[];
  createdAt: Date;
  updatedAt: Date;
}

const MessSchema = new Schema<IMess>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["veg", "non-veg", "both"],
      default: "both",
    },
    cuisine: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    contactNumber: {
      type: String,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    plans: [
      {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        duration: { type: Number, required: true },
      },
    ],
    menu: [
      {
        date: { type: Date, required: true },
        items: [
          {
            name: { type: String, required: true },
            description: { type: String },
            type: { type: String, enum: ["veg", "non-veg"], default: "veg" },
            image: { type: String },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Mess ||
  mongoose.model<IMess>("Mess", MessSchema);
