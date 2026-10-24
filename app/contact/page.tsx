"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from "lucide-react"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-500">Get in touch</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-3">Contact WASA Kitchens</h1>
            <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
              Have questions regarding our 3D planner, modular cabinetry, pricing, or shipping? Our specialized team is here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contact Details */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Showroom & Headquarters</h4>
                    <p className="text-xs text-gray-600 mt-1">Vasagatan 12, 111 20 Stockholm, Sweden</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Email Us</h4>
                    <p className="text-xs text-gray-600 mt-1">support@kitchenplanner.com</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Call Us</h4>
                    <p className="text-xs text-gray-600 mt-1">+46 (0)8 123 456 78</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Opening Hours</h4>
                    <p className="text-xs text-gray-600 mt-1">Mon – Fri: 09:00 – 18:00 CET<br />Sat: 10:00 – 16:00 CET</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center space-y-4">
                  <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto" />
                  <h3 className="text-2xl font-bold text-gray-900">Message Received!</h3>
                  <p className="text-sm text-gray-700 max-w-md mx-auto">
                    Thank you for reaching out, <span className="font-semibold">{form.name}</span>. A team member will respond to <span className="font-semibold">{form.email}</span> within 24 business hours.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)} className="rounded-full mt-4">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="border border-gray-200 rounded-xl p-6 md:p-8 space-y-5 bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Your Name*</label>
                      <Input
                        required
                        placeholder="Alex Morgan"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Your Email*</label>
                      <Input
                        required
                        type="email"
                        placeholder="alex@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone (Optional)</label>
                      <Input
                        type="tel"
                        placeholder="+46..."
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Subject*</label>
                      <Input
                        required
                        placeholder="Kitchen quotation inquiry"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Message*</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your kitchen project or questions..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 py-3 rounded-full text-sm font-semibold">
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
