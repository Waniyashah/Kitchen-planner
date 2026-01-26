"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, ShoppingCart } from "lucide-react"

const PRODUCTS = [
  {
    id: "cab-001",
    name: "Modern White Base Cabinet",
    category: "cabinets",
    price: 299,
    image: "/white-kitchen-cabinet.jpg",
    description: "Sleek white base cabinet with soft-close doors",
    specs: { width: "36in", height: "34.5in", depth: "24in" },
  },
  {
    id: "cab-002",
    name: "Oak Wood Wall Cabinet",
    category: "cabinets",
    price: 249,
    image: "/oak-wood-kitchen-cabinet.jpg",
    description: "Classic oak wood wall cabinet with glass doors",
    specs: { width: "36in", height: "30in", depth: "12in" },
  },
  {
    id: "cab-003",
    name: "Espresso Corner Cabinet",
    category: "cabinets",
    price: 399,
    image: "/espresso-corner-cabinet.jpg",
    description: "Premium espresso corner cabinet with lazy susan",
    specs: { width: "36in", height: "36in", depth: "24in" },
  },
  {
    id: "cab-004",
    name: "Gray Tall Pantry Cabinet",
    category: "cabinets",
    price: 549,
    image: "/gray-tall-pantry-cabinet.jpg",
    description: "Spacious tall pantry cabinet in modern gray",
    specs: { width: "24in", height: "84in", depth: "24in" },
  },
  {
    id: "app-001",
    name: "Stainless Steel Range",
    category: "appliances",
    price: 1299,
    image: "/stainless-steel-kitchen-range.jpg",
    description: "Professional 5-burner gas range with convection oven",
    specs: { width: "36in", height: "36in", depth: "28in" },
  },
  {
    id: "app-002",
    name: "French Door Refrigerator",
    category: "appliances",
    price: 1899,
    image: "/french-door-refrigerator.jpg",
    description: "25 cu ft French door refrigerator with ice maker",
    specs: { width: "36in", height: "70in", depth: "34in" },
  },
  {
    id: "app-003",
    name: "Dishwasher - Quiet Series",
    category: "appliances",
    price: 699,
    image: "/quiet-dishwasher.jpg",
    description: "Ultra-quiet dishwasher with 16 place settings",
    specs: { width: "24in", height: "34in", depth: "24in" },
  },
  {
    id: "app-004",
    name: "Undermount Sink",
    category: "sinks",
    price: 449,
    image: "/undermount-kitchen-sink.jpg",
    description: "Double bowl stainless steel undermount sink",
    specs: { width: "33in", height: "10in", depth: "22in" },
  },
  {
    id: "app-005",
    name: "Microwave Oven",
    category: "appliances",
    price: 399,
    image: "/microwave-oven.png",
    description: "Over-the-range microwave with 1.8 cu ft capacity",
    specs: { width: "30in", height: "17in", depth: "16in" },
  },
  {
    id: "app-006",
    name: "Cooktop - 5 Burner",
    category: "appliances",
    price: 799,
    image: "/5-burner-cooktop.jpg",
    description: "Electric cooktop with 5 burners and touch controls",
    specs: { width: "36in", height: "3in", depth: "26in" },
  },
  {
    id: "acc-001",
    name: "Granite Countertop",
    category: "countertops",
    price: 89,
    image: "/granite-countertop.jpg",
    description: "Premium granite countertop per linear foot",
    specs: { width: "25.5in", height: "1.25in", depth: "varies" },
  },
  {
    id: "acc-002",
    name: "Quartz Countertop",
    category: "countertops",
    price: 99,
    image: "/quartz-countertop.png",
    description: "Engineered quartz countertop per linear foot",
    specs: { width: "25.5in", height: "1.25in", depth: "varies" },
  },
]

interface CatalogProps {
  onAddToCart: (product: any) => void
  cartCount: number
}

export function ProductCatalog({ onAddToCart, cartCount }: CatalogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("name")

  const categories = ["cabinets", "appliances", "sinks", "countertops"]

  const filteredProducts = useMemo(() => {
    let filtered = PRODUCTS

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price)
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    return filtered
  }, [searchQuery, selectedCategory, sortBy])

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Product Catalog</h1>
          <p className="text-muted-foreground">Browse our collection of premium kitchen products</p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Search */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Categories
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === null ? "bg-accent text-accent-foreground" : "hover:bg-muted text-foreground"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors capitalize ${
                        selectedCategory === cat ? "bg-accent text-accent-foreground" : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content - Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {PRODUCTS.length} products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow border border-border"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-muted overflow-hidden">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-semibold capitalize">
                        {product.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>

                      {/* Specs */}
                      <div className="text-xs text-muted-foreground mb-4 space-y-1">
                        {Object.entries(product.specs).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key}:</span>
                            <span>{value as string}</span>
                          </div>
                        ))}
                      </div>

                      {/* Price and Button */}
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-accent">${product.price}</span>
                        <Button
                          size="sm"
                          onClick={() => onAddToCart(product)}
                          className="bg-primary hover:bg-primary/90 gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
