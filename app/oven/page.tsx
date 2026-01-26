import QuestionCard from "@/components/QuestionCard"

export default function OvenPage() {
  return (
    <QuestionCard
      questionNumber={1}
      title="Where would you like to place the oven?"
      subtitle="You can show preference by selecting one of all"
      optionA={{
        label: "Under the Worktop",
        value: "under",
        desc: "Classic Placement and easy reach great for small kitchens",
        img: "/oven1.png",
      }}
      optionB={{
        label: "In a tall cabinet",
        value: "tall",
        desc: "At an ergonomic height next to the worktop",
        img: "/oven2.png",
      }}
      nextPath="/hood"
      prevPath="/"
      answerKey="oven"
    />
  )
}
