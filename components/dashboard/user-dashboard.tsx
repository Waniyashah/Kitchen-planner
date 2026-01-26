"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Plus, FileText, Settings, LogOut, Download, Share2, Trash2, Eye, Edit } from "lucide-react"
import { useState } from "react"

interface UserDashboardProps {
  user: any
}

export function UserDashboard({ user }: UserDashboardProps) {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Modern Kitchen Design",
      created: "2025-01-15",
      items: 12,
      status: "In Progress",
      thumbnail: "/modern-kitchen.png",
      lastModified: "2025-01-20",
    },
    {
      id: 2,
      name: "Minimalist Kitchen",
      created: "2025-01-10",
      items: 8,
      status: "Completed",
      thumbnail: "/minimalist-kitchen.png",
      lastModified: "2025-01-18",
    },
    {
      id: 3,
      name: "Luxury Kitchen Renovation",
      created: "2025-01-05",
      items: 15,
      status: "In Progress",
      thumbnail: "/luxury-kitchen.png",
      lastModified: "2025-01-19",
    },
  ])

  const [orders, setOrders] = useState([
    {
      id: "ORD-001",
      date: "2025-01-20",
      total: 2500.0,
      status: "Delivered",
      items: 5,
    },
    {
      id: "ORD-002",
      date: "2025-01-15",
      total: 1800.5,
      status: "Shipped",
      items: 3,
    },
    {
      id: "ORD-003",
      date: "2025-01-10",
      total: 3200.0,
      status: "Processing",
      items: 8,
    },
  ])

  const handleLogout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  const handleDeleteProject = (id: number) => {
    setProjects(projects.filter((p) => p.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-accent/20 text-accent"
      case "In Progress":
        return "bg-secondary/20 text-secondary"
      case "Delivered":
        return "bg-accent/20 text-accent"
      case "Shipped":
        return "bg-secondary/20 text-secondary"
      case "Processing":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Welcome, {user.name || user.email}</h1>
            <p className="text-muted-foreground">Manage your kitchen designs and orders</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Projects</p>
          <p className="text-3xl font-bold text-foreground">{projects.length}</p>
        </Card>
        <Card className="p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-foreground">{orders.length}</p>
        </Card>
        <Card className="p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Total Spent</p>
          <p className="text-3xl font-bold text-accent">${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</p>
        </Card>
        <Card className="p-6 border border-border">
          <p className="text-sm text-muted-foreground mb-2">Active Projects</p>
          <p className="text-3xl font-bold text-foreground">
            {projects.filter((p) => p.status === "In Progress").length}
          </p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">My Kitchen Projects</h2>
            <Link href="/designer">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden border border-border hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className="relative h-40 bg-muted overflow-hidden">
                  <img
                    src={project.thumbnail || "/placeholder.svg"}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-lg mb-2">{project.name}</h3>

                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <p>Created: {project.created}</p>
                    <p>Modified: {project.lastModified}</p>
                    <p>Items: {project.items}</p>
                  </div>

                  <div className="flex gap-2">
                    <Link href="/designer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full bg-transparent gap-2">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent gap-2"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Order History</h2>

          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">Ordered on {order.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Items</p>
                    <p className="font-semibold text-foreground">{order.items}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-semibold text-accent">${order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-semibold text-foreground">{order.status}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent gap-2">
                    <Download className="w-4 h-4" />
                    Invoice
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Account Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card className="p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Profile Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1">Email</label>
                  <p className="text-foreground">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1">Name</label>
                  <p className="text-foreground">{user.name || "Not set"}</p>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Edit Profile
                </Button>
              </div>
            </Card>

            {/* Preferences */}
            <Card className="p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">Email Notifications</label>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">Order Updates</label>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-foreground">Marketing Emails</label>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              </div>
            </Card>

            {/* Billing */}
            <Card className="p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Billing Information</h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Manage your payment methods and billing address</p>
                <Button variant="outline" className="w-full bg-transparent">
                  Manage Billing
                </Button>
              </div>
            </Card>

            {/* Security */}
            <Card className="p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Security</h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Update your password and security settings</p>
                <Button variant="outline" className="w-full bg-transparent">
                  Change Password
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
