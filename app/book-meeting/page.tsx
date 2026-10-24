"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Video, UserCheck, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function BookMeetingPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    timeSlot: "10:00 AM - 11:00 AM",
    meetingType: "video",
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-500">1-on-1 Consultation</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">Book a Kitchen Design Meeting</h1>
            <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
              Meet with an expert WASA kitchen specialist online or in-showroom to refine your 3D layout, pick materials, and get an accurate quote.
            </p>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Meeting Confirmed!</h2>
              <p className="text-gray-700 max-w-md mx-auto text-sm">
                Thank you, <span className="font-semibold">{formData.name}</span>. A calendar invitation and video link have been sent to <span className="font-semibold">{formData.email}</span>.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/define">
                  <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-6">
                    Continue to 3D Planner
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => setSubmitted(false)} className="rounded-full">
                  Book Another Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Info Column */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">What to expect:</h3>
                  <div className="flex gap-3 text-sm text-gray-700">
                    <Clock className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span>45-60 minute personalized consultation</span>
                  </div>
                  <div className="flex gap-3 text-sm text-gray-700">
                    <Video className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span>Virtual video call or in-store meeting</span>
                  </div>
                  <div className="flex gap-3 text-sm text-gray-700">
                    <UserCheck className="w-5 h-5 text-gray-600 flex-shrink-0" />
                    <span>Dedicated certified kitchen architect</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  Tip: Have your room dimensions or floor plan handy to make the most of the design session!
                </div>
              </div>

              {/* Form Column */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 space-y-5 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Your Full Name*</label>
                      <Input
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address*</label>
                      <Input
                        required
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone Number*</label>
                      <Input
                        required
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Preferred Date*</label>
                      <Input
                        required
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Preferred Time Slot*</label>
                      <select
                        value={formData.timeSlot}
                        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option>09:00 AM - 10:00 AM</option>
                        <option>10:00 AM - 11:00 AM</option>
                        <option>01:00 PM - 02:00 PM</option>
                        <option>03:00 PM - 04:00 PM</option>
                        <option>05:00 PM - 06:00 PM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Meeting Format*</label>
                      <select
                        value={formData.meetingType}
                        onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                      >
                        <option value="video">Online Video Call (Zoom/Google Meet)</option>
                        <option value="showroom">In-Person Showroom Visit</option>
                        <option value="phone">Phone Call</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Design Notes or Goals (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="e.g., L-shaped kitchen with large island, preference for modern dark oak finishes..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 py-3 rounded-full text-sm font-semibold">
                    Confirm & Schedule Design Meeting
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
