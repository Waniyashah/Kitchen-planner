"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"

export type Answers = {
  layout: string
  oven: string
  fridge: string
  hood: string
}

export type AnswersContextType = {
  answers: Answers
  updateAnswer: (key: keyof Answers, value: string) => void
}

const AnswersContext = createContext<AnswersContextType | undefined>(undefined)

export const AnswersProvider = ({ children }: { children: ReactNode }) => {
  const initialAnswers: Answers = { layout: "", oven: "", fridge: "", hood: "" }
  const [answers, setAnswers] = useState<Answers>(initialAnswers)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kitchenAnswers")
      if (saved) setAnswers(JSON.parse(saved))
    } catch (e) {
      console.warn("Failed to load kitchenAnswers from localStorage", e)
    }
  }, [])

  const updateAnswer = (key: keyof Answers, value: string) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [key]: value }
      localStorage.setItem("kitchenAnswers", JSON.stringify(newAnswers))
      return newAnswers
    })
  }

  return <AnswersContext.Provider value={{ answers, updateAnswer }}>{children}</AnswersContext.Provider>
}

export const useAnswers = () => {
  const ctx = useContext(AnswersContext)
  if (!ctx) throw new Error("useAnswers must be used within AnswersProvider")
  return ctx
}
