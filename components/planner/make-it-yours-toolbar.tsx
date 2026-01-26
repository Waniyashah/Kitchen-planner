"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { usePlannerStore } from "@/lib/planner-store"
import Image from "next/image"
import {
    Info
} from 'lucide-react'

export function MakeItYoursToolbar() {
    const { room } = usePlannerStore()
    const [showCabinetsMenu, setShowCabinetsMenu] = useState(false)
    const [showAppliancesMenu, setShowAppliancesMenu] = useState(false)
    const [showKitchenExtrasMenu, setShowKitchenExtrasMenu] = useState(false)
    const [showDiningMenu, setShowDiningMenu] = useState(false)

    const CABINET_CATEGORIES = [
        {
            title: "Base cabinets",
            items: [
                "For corner",
                "For sink",
                "For hob",
                "For hob & oven",
                "For dishwasher",
                "For washing machine",
                "For fridge & freezer",
                "With drawers",
                "With door",
                "With door & drawer",
                "With pull-out",
                "With wire basket",
                "Open cabinets",
                "Other",
                "Filler pieces & cover panels"
            ]
        },
        {
            title: "Wall cabinets",
            items: [
                "With door",
                "With glass doors",
                "Horizontal cabinets",
                "For corner",
                "For extractor hood",
                "For microwave oven",
                "Top cabinets",
                "Open cabinets",
                "Other",
                "Filler pieces & cover panels"
            ]
        },
        {
            title: "High cabinets",
            items: [
                "For fridge & freezer",
                "For oven",
                "For microwave oven",
                "For combi oven",
                "For oven & microwave oven",
                "For oven & combi oven",
                "With door & drawer",
                "With door",
                "With cleaning interior",
                "Filler pieces & cover panels",
                "High cabinets with pullout"
            ]
        }
    ]

    const APPLIANCE_CATEGORIES = [
        {
            title: "Integrated in cabinet",
            items: [
                "Fridge & freezer",
                "Hob",
                "Oven",
                "Hob & oven",
                "Microwave oven",
                "Combi oven",
                "Oven & microwave oven",
                "Oven & combi oven",
                "Microwave / combi oven",
                "Microwave / combi / steam oven",
                "Extractor hood",
                "Dishwasher",
                "Washing machine"
            ]
        },
        {
            title: "Freestanding",
            items: [
                "Fridge & freezer",
                "Hob",
                "Extractor hood",
                "Microwave oven",
                "Use your own",
                "Wine coolers"
            ]
        }
    ]

    const KITCHEN_EXTRAS_CATEGORIES = [
        {
            title: "Extras",
            items: [
                "Trolleys",
                "Solitaire kitchen islands",
                "Wall shelves",
                "Step stools & ladders",
                "kitchen accessories",
                "Freestanding Waste Sorting"
            ]
        },
        {
            title: "Wall organisers",
            items: [
                "KUNGSFORS series",
                "HULTARP series"
            ]
        },
        {
            title: "Complementary items",
            items: [
                "Complementary items"
            ]
        }
    ]

    const DINING_CATEGORIES = [
        {
            title: "Tables",
            items: [
                "Up to 2 seats",
                "Up to 4 seats",
                "Up to 6 seats",
                "Up to 8 seats",
                "Wall mounted"
            ]
        },
        {
            title: "Dining chairs",
            items: [
                "Upholstered",
                "Non-upholstered",
                "Foldable",
                "Stackable"
            ]
        },
        {
            title: "Bar furniture",
            items: [
                "Bar tables",
                "Bar stools",
                "Foldable bar stools",
                "Height adjustable stools"
            ]
        },
        {
            title: "Stools & Benches",
            items: [
                "Stools",
                "Benches",
                "Step stools & ladders"
            ]
        }
    ]

    return (
        <div className="relative flex h-24 items-center justify-between border-b border-[#dfdfdf] bg-white pl-0 pr-4">

            {/* LEFT SIDE */}
            <div className="flex items-center h-full pl-4">

                {/* Group 1: Cabinets & Appliances */}
                <div className="flex items-center gap-1">
                    <div className="relative">
                        <Button variant="ghost"
                            className="group flex flex-col items-center justify-center gap-2 h-auto py-2 px-2 hover:bg-transparent rounded-none"
                            onClick={() => {
                                setShowCabinetsMenu(!showCabinetsMenu)
                                setShowAppliancesMenu(false)
                                setShowKitchenExtrasMenu(false)
                                setShowDiningMenu(false)
                            }}
                        >
                            <div className={`border ${showCabinetsMenu ? 'border-[#0058a3] bg-[#0058a3]/5' : 'border-[#dfdfdf]'} p-3 rounded-sm w-14 h-14 flex items-center justify-center hover:border-[#0058a3] hover:bg-[#0058a3]/5`}>
                                <Image
                                    src="/icons/cabinets.svg"
                                    alt="Cabinets"
                                    width={32}
                                    height={32}
                                    className="h-8 w-8"
                                />
                            </div>
                            <span className={`text-[15px] font-medium ${showCabinetsMenu ? 'text-[#0058a3]' : 'group-hover:text-[#0058a3]'}`}>Cabinets</span>
                        </Button>

                        {/* CABINETS DROPDOWN MENU */}
                        {showCabinetsMenu && (
                            <div className="absolute top-full left-0 mt-2 w-[800px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 rounded z-50 p-6 animate-in fade-in zoom-in-95 duration-100">
                                {/* Tiny arrow pointing up */}
                                <div className="absolute -top-1.5 left-8 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>

                                <div className="grid grid-cols-3 gap-8">
                                    {CABINET_CATEGORIES.map((category, index) => (
                                        <div key={index} className="flex flex-col">
                                            <h3 className="font-bold text-[15px] mb-4 text-gray-900 pb-2 border-b border-gray-100">
                                                {category.title}
                                            </h3>
                                            <div className="flex flex-col gap-2">
                                                {category.items.map((item, itemIndex) => (
                                                    <button
                                                        key={itemIndex}
                                                        className="text-left text-[13px] text-gray-700 hover:text-[#0058a3] hover:underline py-0.5"
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Button variant="ghost"
                            className="group flex flex-col items-center justify-center gap-2 h-auto py-2 px-2 hover:bg-transparent rounded-none"
                            onClick={() => {
                                setShowAppliancesMenu(!showAppliancesMenu)
                                setShowCabinetsMenu(false)
                                setShowKitchenExtrasMenu(false)
                                setShowDiningMenu(false)
                            }}
                        >
                            <div className={`border ${showAppliancesMenu ? 'border-[#0058a3] bg-[#0058a3]/5' : 'border-[#dfdfdf]'} p-3 rounded-sm w-14 h-14 flex items-center justify-center hover:border-[#0058a3] hover:bg-[#0058a3]/5`}>
                                <Image
                                    src="/icons/appliances.png"
                                    alt="Appliances"
                                    width={32}
                                    height={32}
                                    className="h-8 w-8"
                                />
                            </div>
                            <span className={`text-[15px] font-medium ${showAppliancesMenu ? 'text-[#0058a3]' : 'group-hover:text-[#0058a3]'}`}>Appliances</span>
                        </Button>

                        {/* APPLIANCES DROPDOWN MENU */}
                        {showAppliancesMenu && (
                            <div className="absolute top-full left-[50px] mt-2 w-[500px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 rounded z-50 p-6 animate-in fade-in zoom-in-95 duration-100">
                                {/* Tiny arrow pointing up */}
                                <div className="absolute -top-1.5 left-8 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>

                                <div className="grid grid-cols-2 gap-8">
                                    {APPLIANCE_CATEGORIES.map((category, index) => (
                                        <div key={index} className="flex flex-col">
                                            <h3 className="font-bold text-[15px] mb-4 text-gray-900 pb-2 border-b border-gray-100">
                                                {category.title}
                                            </h3>
                                            <div className="flex flex-col gap-2">
                                                {category.items.map((item, itemIndex) => (
                                                    <button
                                                        key={itemIndex}
                                                        className="text-left text-[13px] text-gray-700 hover:text-[#0058a3] hover:underline py-0.5"
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Separator */}
                <div className="h-16 w-px bg-[#dfdfdf] mx-4" />

                {/* Group 2: Dining & Kitchen extras */}
                <div className="flex items-center gap-1">
                    <div className="relative">
                        <Button variant="ghost"
                            className="group flex flex-col items-center justify-center gap-2 h-auto py-2 px-2 hover:bg-transparent rounded-none"
                            onClick={() => {
                                setShowDiningMenu(!showDiningMenu)
                                setShowCabinetsMenu(false)
                                setShowAppliancesMenu(false)
                                setShowKitchenExtrasMenu(false)
                            }}
                        >
                            <div className={`border ${showDiningMenu ? 'border-[#0058a3] bg-[#0058a3]/5' : 'border-[#dfdfdf]'} p-3 rounded-sm w-14 h-14 flex items-center justify-center hover:border-[#0058a3] hover:bg-[#0058a3]/5`}>
                                <Image
                                    src="/icons/dining.svg"
                                    alt="Dining"
                                    width={32}
                                    height={32}
                                    className="h-8 w-8"
                                />
                            </div>
                            <span className={`text-[15px] font-medium ${showDiningMenu ? 'text-[#0058a3]' : 'group-hover:text-[#0058a3]'}`}>Dining</span>
                        </Button>

                        {/* DINING DROPDOWN MENU */}
                        {showDiningMenu && (
                            <div className="absolute top-full left-0 mt-2 w-[800px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 rounded z-50 p-6 animate-in fade-in zoom-in-95 duration-100">
                                {/* Tiny arrow pointing up */}
                                <div className="absolute -top-1.5 left-8 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>

                                <div className="grid grid-cols-4 gap-8">
                                    {DINING_CATEGORIES.map((category, index) => (
                                        <div key={index} className="flex flex-col">
                                            <h3 className="font-bold text-[15px] mb-4 text-gray-900 pb-2 border-b border-gray-100">
                                                {category.title}
                                            </h3>
                                            <div className="flex flex-col gap-2">
                                                {category.items.map((item, itemIndex) => (
                                                    <button
                                                        key={itemIndex}
                                                        className="text-left text-[13px] text-gray-700 hover:text-[#0058a3] hover:underline py-0.5"
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Button variant="ghost"
                            className="group flex flex-col items-center justify-center gap-2 h-auto py-2 px-2 hover:bg-transparent rounded-none"
                            onClick={() => {
                                setShowKitchenExtrasMenu(!showKitchenExtrasMenu)
                                setShowCabinetsMenu(false)
                                setShowAppliancesMenu(false)
                                setShowDiningMenu(false)
                            }}
                        >
                            <div className={`border ${showKitchenExtrasMenu ? 'border-[#0058a3] bg-[#0058a3]/5' : 'border-[#dfdfdf]'} p-3 rounded-sm w-14 h-14 flex items-center justify-center hover:border-[#0058a3] hover:bg-[#0058a3]/5`}>
                                <Image
                                    src="/icons/kitchen-extras.svg"
                                    alt="Kitchen extras"
                                    width={32}
                                    height={32}
                                    className="h-8 w-8"
                                />
                            </div>
                            <span className={`text-[15px] font-medium ${showKitchenExtrasMenu ? 'text-[#0058a3]' : 'group-hover:text-[#0058a3]'}`}>Kitchen extras</span>
                        </Button>

                        {/* KITCHEN EXTRAS DROPDOWN MENU */}
                        {showKitchenExtrasMenu && (
                            <div className="absolute top-full left-[50px] -translate-x-1/2 mt-2 w-[700px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 rounded z-50 p-6 animate-in fade-in zoom-in-95 duration-100">
                                {/* Tiny arrow pointing up - slightly adjusted position */}
                                <div className="absolute -top-1.5 left-1/2 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>

                                <div className="grid grid-cols-3 gap-8">
                                    {KITCHEN_EXTRAS_CATEGORIES.map((category, index) => (
                                        <div key={index} className="flex flex-col">
                                            <h3 className="font-bold text-[15px] mb-4 text-gray-900 pb-2 border-b border-gray-100">
                                                {category.title}
                                            </h3>
                                            <div className="flex flex-col gap-2">
                                                {category.items.map((item, itemIndex) => (
                                                    <button
                                                        key={itemIndex}
                                                        className="text-left text-[13px] text-gray-700 hover:text-[#0058a3] hover:underline py-0.5"
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Separator */}
                <div className="h-16 w-px bg-[#dfdfdf] mx-4" />

                {/* Group 3: Search */}
                <div className="flex items-center gap-1">
                    <Button variant="ghost"
                        className="group flex flex-col items-center justify-center gap-2 h-auto py-2 px-2 hover:bg-transparent rounded-none"
                    >
                        <div className="border border-[#dfdfdf] p-3 rounded-sm w-14 h-14 flex items-center justify-center hover:border-[#0058a3] hover:bg-[#0058a3]/5">
                            <Image
                                src="/icons/search-outline-svgrepo-com.svg"
                                alt="Search"
                                width={32}
                                height={32}
                                className="h-8 w-8"
                            />
                        </div>
                        <span className="text-[15px] font-medium group-hover:text-[#0058a3]">Search</span>
                    </Button>
                </div>

                {/* Separator */}
                <div className="h-16 w-px bg-[#dfdfdf] mx-4" />

                {/* Group 4: Create & View Image */}
                <div className="flex items-center gap-1">
                    <Button variant="ghost"
                        className="group flex flex-col items-center justify-center gap-2 h-auto py-2 px-2 hover:bg-transparent rounded-none"
                    >
                        <div className="border border-[#dfdfdf] p-3 rounded-sm w-14 h-14 flex items-center justify-center hover:border-[#0058a3] hover:bg-[#0058a3]/5">
                            <Image
                                src="/icons/camera.svg"
                                alt="Create image"
                                width={32}
                                height={32}
                                className="h-8 w-8"
                            />
                        </div>
                        <span className="text-[15px] font-medium group-hover:text-[#0058a3]">Create image</span>
                    </Button>

                    <Button variant="ghost"
                        className="group flex flex-col items-center justify-center gap-2 h-auto py-2 px-2 hover:bg-transparent rounded-none"
                    >
                        <div className="border border-[#dfdfdf] p-3 rounded-sm w-14 h-14 flex items-center justify-center hover:border-[#0058a3] hover:bg-[#0058a3]/5">
                            <Image
                                src="/icons/gallery.svg"
                                alt="View images"
                                width={32}
                                height={32}
                                className="h-8 w-8"
                            />
                        </div>
                        <span className="text-[15px] font-medium group-hover:text-[#0058a3]">View images</span>
                    </Button>
                </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-8 pr-4">
                <div className="flex flex-col items-end">
                    <span className="text-sm">My Wasa kitchen</span>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">€0.00</span>
                        <Info className="h-4 w-4 cursor-pointer" />
                    </div>
                </div>

                <Button className="bg-[#0058a3] hover:bg-[#004f93] text-white px-8 h-10 rounded-full font-bold text-sm">
                    Continue
                </Button>
            </div>

        </div>
    )
}
