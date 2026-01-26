// components/QuestionCard.tsx
"use client"
import { useRouter } from "next/navigation"
import { useAnswers } from "@/context/AnswerContext"
import Image from "next/image"

interface OptionConfig {
  label: string
  value: string
  desc: string
  img: string
}

interface QuestionCardProps {
  questionNumber: number
  title: string
  subtitle: string
  optionA: OptionConfig
  optionB: OptionConfig
  nextPath: string
  prevPath?: string | null
  answerKey: "oven" | "hood" | "fridge" | "layout"
}

export default function QuestionCard({
  questionNumber,
  title,
  subtitle,
  optionA,
  optionB,
  nextPath,
  prevPath,
  answerKey,
}: QuestionCardProps) {
  const router = useRouter()
  const { answers, updateAnswer } = useAnswers()
  const selectedValue = answers[answerKey]

  const handleSelect = (value: string) => {
    updateAnswer(answerKey, value)
  }

  const handleNext = () => router.push(nextPath)
  const handlePrev = () => prevPath && router.push(prevPath)

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 bg-white">
      <div className="max-w-4xl w-full mx-auto">
        {/* Back Button */}
        <button
          onClick={handlePrev}
          className="text-gray-700 hover:text-gray-900 flex items-center mb-8 font-medium text-sm"
        >
          ← Start Page
        </button>

        {/* Question Header */}
        <div className="mb-12">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            Question {questionNumber} of 4
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-2">{title}</h1>
          <p className="text-gray-600 text-sm">{subtitle}</p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[optionA, optionB].map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all bg-white flex flex-col ${
                selectedValue === option.value
                  ? "border-black ring-2 ring-black ring-offset-2"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {/* Image wrapper */}
              <div className="relative w-full aspect-[4/3] bg-gray-50 flex items-center justify-center">
                <Image
                  src={option.img}
                  alt={option.label}
                  fill
                  className="object-cover p-4"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Text content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{option.label}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {option.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Button */}
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            disabled={!selectedValue}
            className={`px-10 py-3 rounded-full font-semibold text-lg transition-all flex items-center gap-2 ${
              selectedValue
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next Question →
          </button>
        </div>
      </div>
    </div>
  )
}
