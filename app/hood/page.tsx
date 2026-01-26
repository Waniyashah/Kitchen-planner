import QuestionCard from "@/components/QuestionCard"

export default function HoodPage() {
  return (
    <QuestionCard
      questionNumber={2}
      title="Which Extractor hood type do you prefer?"
      subtitle="You can show preference by selecting one of all"
      optionA={{
        label: "Integrated",
        value: "integrated",
        desc: "Discreetly placed within the above cabinet",
        img: "/hood1.png",
      }}
      optionB={{
        label: "Wall / Ceiling mounted",
        value: "wall",
        desc: "Adjustable and does not require a wall cabinet",
        img: "/hood2.png",
      }}
      nextPath="/fridge"
      prevPath="/oven"
      answerKey="hood"
    />
  )
}
