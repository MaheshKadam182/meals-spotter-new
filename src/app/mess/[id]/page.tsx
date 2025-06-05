"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
} from "lucide-react";

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

interface MenuForDate {
  date: string;
  items: MenuItem[];
}

interface SubscriptionPlan {
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface Mess {
  id: string;
  name: string;
  type: "veg" | "non-veg" | "both";
  location: string;
  address: string;
  contactNumber: string;
  description: string;
  cuisine: string[];
  image: string;
  plans: SubscriptionPlan[];
  menu: MenuForDate[];
}

export default function MessDetailsPage() {
  const { id } = useParams();
  const [mess, setMess] = useState<Mess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessDetails = async () => {
      try {
        if (!id) return;

        const response = await fetch(`/api/messes/${id}`);
        const data = await response.json();

        if (response.ok) {
          setMess(data.mess);
        } else {
          setError(data.error || "Failed to load mess details");
        }
      } catch (err) {
        setError("Error fetching mess details. Please try again later.");
        console.error("Error fetching mess details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-primary mb-8 hover:underline"
        >
          <ChevronLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!mess) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-primary mb-8 hover:underline"
        >
          <ChevronLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>

        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Mess Not Found</h2>
          <p className="text-muted-foreground">
            The mess you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-primary mb-8 hover:underline"
      >
        <ChevronLeft size={16} />
        <span>Back to Dashboard</span>
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="relative w-full h-64 overflow-hidden rounded-lg">
            <Image
              src={mess.image || defaultImage}
              alt={mess.name}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{mess.name}</h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  mess.type === "veg"
                    ? "bg-green-100 text-green-800"
                    : mess.type === "non-veg"
                    ? "bg-red-100 text-red-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {mess.type === "veg"
                  ? "Vegetarian Only"
                  : mess.type === "non-veg"
                  ? "Non-vegetarian Only"
                  : "Both Veg & Non-veg"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {mess.cuisine.map((item, index) => (
                <span
                  key={index}
                  className="inline-block rounded-full bg-secondary px-3 py-1 text-xs"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="flex items-start gap-2 mt-4 text-muted-foreground">
              <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p>{mess.location}</p>
                <p>{mess.address}</p>
              </div>
            </div>

            {mess.contactNumber && (
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <p>{mess.contactNumber}</p>
              </div>
            )}

            {mess.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-muted-foreground">{mess.description}</p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <Tabs defaultValue="menu">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="menu">Menu</TabsTrigger>
                <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
              </TabsList>

              <TabsContent value="menu" className="mt-6">
                {mess.menu && mess.menu.length > 0 ? (
                  <div className="space-y-6">
                    {mess.menu.map((menuItem, menuIndex) => (
                      <Card key={menuIndex}>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {new Date(menuItem.date).toLocaleDateString()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {menuItem.items.map((item, itemIndex) => (
                              <div
                                key={itemIndex}
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
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">
                      No Menu Available
                    </h3>
                    <p className="text-muted-foreground">
                      This mess hasn&apos;t uploaded their menu yet
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="plans" className="mt-6">
                {mess.plans && mess.plans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mess.plans.map((plan, planIndex) => (
                      <Card key={planIndex}>
                        <CardHeader>
                          <CardTitle>{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-3xl font-bold">
                                ₹{plan.price}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {plan.duration} days
                              </p>
                            </div>
                            <Button>Subscribe</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-lg">
                    <h3 className="text-xl font-medium mb-2">
                      No Plans Available
                    </h3>
                    <p className="text-muted-foreground">
                      This mess hasn&apos;t created any subscription plans yet
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscribe</CardTitle>
              <CardDescription>
                Choose a mess plan that suits your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mess.plans && mess.plans.length > 0 ? (
                  mess.plans.map((plan, planIndex) => (
                    <div
                      key={planIndex}
                      className="flex justify-between items-center p-3 border rounded-md"
                    >
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{plan.price} for {plan.duration} days
                        </p>
                      </div>
                      <Button size="sm">Select</Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No subscription plans available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mess.contactNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p>{mess.contactNumber}</p>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p>{mess.location}</p>
                    <p className="text-sm text-muted-foreground">
                      {mess.address}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
