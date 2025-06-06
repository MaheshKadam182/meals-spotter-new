"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AlertCircle } from "lucide-react";

// Default placeholder image
const defaultImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80";
const defaultFoodImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80";

// TypeScript interfaces
interface MenuItem {
  name: string;
  type: "veg" | "non-veg";
  image?: string;
  description?: string;
}

interface Mess {
  id: string;
  name: string;
  type: "veg" | "non-veg" | "both";
  location: string;
  address: string;
  contactNumber: string;
  description?: string;
  cuisine: string[];
  image?: string;
  todayMenu: MenuItem[];
}

export default function Dashboard() {
  const [messes, setMesses] = useState<Mess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMesses = async () => {
      try {
        const response = await fetch("/api/messes");
        const data = await response.json();

        if (response.ok) {
          setMesses(data.messes);
        } else {
          setError(data.error || "Failed to load messes");
        }
      } catch (err) {
        setError("Error fetching messes. Please try again later.");
        console.error("Error fetching messes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMesses();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Explore messes and today&apos;s menu
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {messes.length === 0 && !error ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <h3 className="text-xl font-medium mb-2">No messes available</h3>
            <p className="text-muted-foreground">
              Check back later for updates
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {messes.map((mess) => (
              <div
                key={mess.id}
                className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-all hover:shadow-md"
              >
                <div className="relative w-full h-48 overflow-hidden">
                  <Image
                    src={mess.image || defaultImage}
                    alt={mess.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{mess.name}</h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        mess.type === "veg"
                          ? "bg-green-100 text-green-800"
                          : mess.type === "non-veg"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {mess.type === "veg"
                        ? "Veg"
                        : mess.type === "non-veg"
                        ? "Non-veg"
                        : "Veg & Non-veg"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {mess.location}
                  </p>

                  {mess.todayMenu && mess.todayMenu.length > 0 ? (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium">Today&apos;s Menu</h4>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {mess.todayMenu.slice(0, 4).map((item, index) => (
                          <div
                            key={index}
                            className="flex flex-col rounded-md border p-2"
                          >
                            <div className="relative w-full h-24 mb-2 overflow-hidden rounded-md">
                              <Image
                                src={item.image || defaultFoodImage}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  item.type === "veg"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />
                              {item.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium">Today&apos;s Menu</h4>
                      <p className="mt-2 text-sm text-muted-foreground">
                        No menu available for today
                      </p>
                    </div>
                  )}

                  <div className="mt-6">
                    <Link
                      href={`/mess/${mess.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
