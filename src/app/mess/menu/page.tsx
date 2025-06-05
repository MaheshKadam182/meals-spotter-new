"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Define types
interface MenuItem {
  name: string;
  description?: string;
  type: "veg" | "non-veg";
  image?: string;
}

interface MenuDay {
  date: Date;
  items: MenuItem[];
}

interface MessProfile {
  id: string;
  name: string;
  menu?: MenuDay[];
  [key: string]: unknown;
}

export default function MenuManagement() {
  const [menu, setMenu] = useState<MenuDay[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditing, setIsEditing] = useState<{
    dayIndex: number;
    itemIndex: number;
  } | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      name: "",
      description: "",
      type: "veg",
      image: "",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [menuDate, setMenuDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [messProfile, setMessProfile] = useState<MessProfile | null>(null);

  const { user } = useAuth();

  // Fetch menu data
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch("/api/mess/profile");
        const data = await response.json();

        if (response.ok && data.mess) {
          // Store the full mess profile
          setMessProfile(data.mess);

          // If the menu exists, set it
          if (data.mess.menu && Array.isArray(data.mess.menu)) {
            // Sort menu by date (newest first)
            const sortedMenu = [...data.mess.menu].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setMenu(sortedMenu);
          }
        } else {
          setError(data.error || "Failed to load menu data");
        }
      } catch {
        setError("Error fetching menu data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "mess-owner") {
      fetchMenuData();
    }
  }, [user]);

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const newItems = [...menuItems];
    newItems[index] = {
      ...newItems[index],
      [name]: value,
    };
    setMenuItems(newItems);
  };

  const handleAddMenuItem = () => {
    setMenuItems([
      ...menuItems,
      { name: "", description: "", type: "veg", image: "" },
    ]);
  };

  const handleRemoveMenuItem = (index: number) => {
    if (menuItems.length === 1) {
      return; // Keep at least one item
    }
    const newItems = [...menuItems];
    newItems.splice(index, 1);
    setMenuItems(newItems);
  };

  const handleEditItem = (dayIndex: number, itemIndex: number) => {
    const itemToEdit = menu[dayIndex].items[itemIndex];
    setIsEditing({ dayIndex, itemIndex });
    setMenuDate(new Date(menu[dayIndex].date).toISOString().split("T")[0]);
    setMenuItems([{ ...itemToEdit }]);
    setIsAddingItem(true);
  };

  const handleSaveMenu = async () => {
    // Validate each menu item
    const validItems = menuItems.filter((item) => item.name.trim() !== "");

    if (validItems.length === 0) {
      setMessage("At least one valid menu item with a name is required");
      return;
    }

    if (!menuDate) {
      setMessage("Date is required");
      return;
    }

    if (!messProfile) {
      setError("Unable to update menu: Mess profile not found");
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Get existing menu or create empty array
      const existingMenu = [...menu];

      // Find if there's already a menu for this date
      const dateIndex = existingMenu.findIndex(
        (m) => new Date(m.date).toISOString().split("T")[0] === menuDate
      );

      let updatedMenu: MenuDay[] = [];

      if (isEditing) {
        // We're editing an existing item
        updatedMenu = [...existingMenu];
        const { dayIndex, itemIndex } = isEditing;

        // Replace the item being edited
        updatedMenu[dayIndex].items[itemIndex] = validItems[0];

        // If we have more than one item, add the rest
        if (validItems.length > 1) {
          for (let i = 1; i < validItems.length; i++) {
            updatedMenu[dayIndex].items.push(validItems[i]);
          }
        }
      } else if (dateIndex >= 0) {
        // Adding to existing date's menu
        updatedMenu = [...existingMenu];
        // Add all valid items to this date
        validItems.forEach((item) => {
          updatedMenu[dateIndex].items.push(item);
        });
      } else {
        // Add new date's menu with all valid items
        updatedMenu = [
          ...existingMenu,
          {
            date: new Date(menuDate),
            items: validItems,
          },
        ];
      }

      // Sort menu by date (newest first)
      updatedMenu.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // Make API call to update the menu, including all required profile fields
      const response = await fetch("/api/mess/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Include all the required fields from the mess profile
          name: messProfile.name,
          type: messProfile.type,
          cuisine: messProfile.cuisine,
          location: messProfile.location,
          address: messProfile.address,
          contactNumber: messProfile.contactNumber,
          description: messProfile.description,
          plans: messProfile.plans,
          // Include the updated menu
          menu: updatedMenu,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update menu");
      }

      // Update the local state
      setMenu(data.mess.menu || []);
      setMessProfile(data.mess);
      setIsAddingItem(false);
      setIsEditing(null);
      setMenuItems([
        {
          name: "",
          description: "",
          type: "veg",
          image: "",
        },
      ]);
      setSuccess(true);
      setMessage(
        isEditing
          ? "Menu item updated successfully"
          : "Menu items added successfully"
      );

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setMessage("");
      }, 3000);
    } catch (err) {
      setError(
        (err as Error).message || "Failed to update menu. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (dateIndex: number, itemIndex: number) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess(false);

    try {
      const updatedMenu = [...menu];

      // Remove the item from the menu
      updatedMenu[dateIndex].items.splice(itemIndex, 1);

      // If there are no more items for this date, remove the entire day
      if (updatedMenu[dateIndex].items.length === 0) {
        updatedMenu.splice(dateIndex, 1);
      }

      // Make API call to update the menu
      const response = await fetch("/api/mess/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menu: updatedMenu,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete menu item");
      }

      // Update the local state
      setMenu(data.mess.menu || []);
      setSuccess(true);
      setMessage("Item deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setMessage("");
      }, 3000);
    } catch (err) {
      setError(
        (err as Error).message ||
          "Failed to delete menu item. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const cancelAction = () => {
    setIsAddingItem(false);
    setIsEditing(null);
    setMenuItems([
      {
        name: "",
        description: "",
        type: "veg",
        image: "",
      },
    ]);
    setError("");
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ProtectedRoute requiredRole="mess-owner">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Menu Management</h1>
            <p className="text-muted-foreground">
              Manage your daily menu offerings
            </p>
          </div>

          {!isAddingItem && (
            <Button onClick={() => setIsAddingItem(true)}>
              Add Menu Items
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}

        {isAddingItem && (
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? "Edit Menu Item" : "Add Menu Items"}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? "Update the details of this menu item"
                  : "Add one or more items to your menu for a specific date"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date *</label>
                  <Input
                    type="date"
                    value={menuDate}
                    onChange={(e) => setMenuDate(e.target.value)}
                    disabled={isEditing !== null}
                  />
                </div>

                {menuItems.map((item, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Item {index + 1}</h3>
                      {menuItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMenuItem(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Item Name *
                        </label>
                        <Input
                          name="name"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, e)}
                          placeholder="e.g., Rice, Dal, Curry"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={item.description || ""}
                          onChange={(e) => handleItemChange(index, e)}
                          placeholder="Describe the dish (optional)"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <select
                          name="type"
                          value={item.type}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="veg">Vegetarian</option>
                          <option value="non-veg">Non-Vegetarian</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Image URL (optional)
                        </label>
                        <Input
                          name="image"
                          value={item.image || ""}
                          onChange={(e) => handleItemChange(index, e)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {!isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddMenuItem}
                    className="w-full"
                  >
                    + Add Another Item
                  </Button>
                )}

                {message && !success && (
                  <p className="text-sm text-red-600">{message}</p>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={cancelAction}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveMenu} disabled={actionLoading}>
                    {actionLoading
                      ? "Saving..."
                      : isEditing
                      ? "Update Menu"
                      : "Save Menu Items"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : menu.length > 0 ? (
          <div className="space-y-8">
            {menu.map((day, dayIndex) => (
              <Card key={dayIndex}>
                <CardHeader>
                  <CardTitle>{formatDate(day.date.toString())}</CardTitle>
                  <CardDescription>Menu items for this date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {day.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                      >
                        {item.image && (
                          <div className="relative h-40 w-full">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{item.name}</h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${
                                item.type === "veg"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.type === "veg" ? "Veg" : "Non-Veg"}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-1/2"
                              onClick={() =>
                                handleEditItem(dayIndex, itemIndex)
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-1/2"
                              onClick={() =>
                                handleDeleteItem(dayIndex, itemIndex)
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t added any menu items yet.
              </p>
              <Button onClick={() => setIsAddingItem(true)}>
                Add Your First Menu Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
