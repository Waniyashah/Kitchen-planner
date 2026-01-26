"use client"

import { useAnswers } from "@/context/AnswerContext"
import { useRouter } from "next/navigation"

const kitchenTypes = [
  {
    id: "single-wall",
    value: "single-wall",
    title: "PLANNING A SINGLE-WALL GALLEY KITCHEN",
    image: "/kitchen-single-wall.png",
  },
  {
    id: "l-shaped",
    value: "l-shaped",
    title: "PLANNING AN L-SHAPED KITCHEN",
    image: "/l-shaped-kitchen.png",
  },
  {
    id: "u-shaped",
    value: "u-shaped",
    title: "PLANNING A U-SHAPED KITCHEN",
    image: "/u-shaped-kitchen.png",
  },
  {
    id: "two-wall",
    value: "two-wall",
    title: "PLANNING A TWO-WALL GALLEY KITCHEN",
    image: "/two-wall-kitchen.png",
  },
  {
    id: "island",
    value: "island",
    title: "PLANNING AN ISLAND FORM",
    image: "/island-form-kitchen.png",
  },
  {
    id: "custom",
    value: "custom",
    title: "CUSTOM PLANNING",
    image: "/custom-planning.png",
  },
]

export default function HomePage() {
  const { updateAnswer } = useAnswers()
  const router = useRouter()

  const handleLayoutSelect = (layoutValue: string) => {
    updateAnswer("layout", layoutValue)
    router.push("/oven")
  }

  return (
    <section id="planning-steps" className="py-16 md:py-24 bg-white min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase tracking-tight">
            START PLANNING YOUR DREAM
            <br />
            KITCHEN HERE
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {kitchenTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => handleLayoutSelect(type.value)}
              className="flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            >
              <div className="w-full mb-4 flex justify-center">
                <img
                  src={type.image || "/placeholder.svg"}
                  alt={type.title}
                  className="w-full max-w-xs h-auto object-contain"
                />
              </div>
              <p className="text-gray-900 font-medium text-sm tracking-wide uppercase">{type.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
