"use client"

import { PlannerHeader } from "@/components/planner/planner-header"
import { MakeItYoursToolbar } from "@/components/planner/make-it-yours-toolbar"
import { PlannerCanvas } from "@/components/planner/planner-canvas"

export default function MakeItYoursPage() {
    return (
        <div className="flex h-screen w-full flex-col bg-[#f5f5f5] overflow-hidden">
            <PlannerHeader activeStep="make-it-yours" />
            <MakeItYoursToolbar />

            <div className="relative flex flex-1 overflow-hidden">
                {/* Future panels (Cabinets, Appliances etc) will go here */}

                <div className="flex-1">
                    <PlannerCanvas />
                </div>
            </div>
        </div>
    )
}
