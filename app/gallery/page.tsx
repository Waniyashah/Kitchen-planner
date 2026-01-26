import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function GalleryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Kitchen Gallery</h1>
          <p className="text-muted-foreground text-lg">Explore beautiful kitchen designs from our customers</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-6">Gallery with customer kitchen designs is being built.</p>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
