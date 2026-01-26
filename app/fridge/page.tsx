import QuestionCard from "@/components/QuestionCard"

export default function FridgePage() {
  return (
    <QuestionCard
      questionNumber={3}
      title="Which Type of Fridge / Freezer do you prefer? (Updated)"
      subtitle="You can show preference by selecting one of all"
      optionA={{
        label: "Integrated",
        value: "integrated",
        desc: "Blends in perfectly with the rest of the kitchen",
        img: "/fridge2.jpeg",
      }}
      optionB={{
        label: "Freestanding",
        value: "freestanding",
        desc: "Easy to place and move around the kitchen",
        img: "/fridge1.jpeg",
      }}
      nextPath="/summary"
      prevPath="/hood"
      answerKey="fridge"
    />
  )
}
