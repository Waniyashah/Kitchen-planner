import { Button } from "@/components/ui/button"
import Link from "next/link"

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-lg overflow-hidden shadow-md">
            <img
              src="/laptop-kitchen-design.jpg"
              alt="Design your kitchen online on laptop"
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">Design Your Kitchen Online</h2>
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              We are delighted that you are interested in our kitchens. Design Your kitchen Online lets you plan your
              new kitchen on a virtual basis. Give your imagination a free rein and plan your kitchen in exactly the way
              you want it to be. We will be pleased to assist you if you need professional planning help.
            </p>
            <Link href="/About">
              <Button className="mt-6 bg-gray-900 hover:bg-gray-800 text-white">View More</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
