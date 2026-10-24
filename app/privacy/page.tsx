import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Data Privacy Policy & Legal Notice</h1>
        <div className="prose text-gray-700 text-sm leading-relaxed space-y-4">
          <p>
            Welcome to WASA Kitchens. We value your privacy and are committed to safeguarding your personal information and design data.
          </p>
          <h2 className="text-lg font-semibold text-gray-900 pt-4">1. Information Collection</h2>
          <p>
            We collect information provided directly by you when configuring layouts in our 3D Kitchen Planner, registering an account, booking a design meeting, or placing an order.
          </p>
          <h2 className="text-lg font-semibold text-gray-900 pt-4">2. Kitchen Design State & Storage</h2>
          <p>
            Your kitchen project dimensions, floor plan elements, appliance preferences, and shopping cart are saved securely to ensure seamless resumption of planning across browser sessions.
          </p>
          <h2 className="text-lg font-semibold text-gray-900 pt-4">3. Contact Us</h2>
          <p>
            If you have questions about our data protection policies, please contact privacy@kitchenplanner.com.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
