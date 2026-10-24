import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service & Cookie Policy</h1>
        <div className="prose text-gray-700 text-sm leading-relaxed space-y-4">
          <p>
            These terms govern your use of the WASA Kitchens website and 3D Kitchen Planning tools.
          </p>
          <h2 className="text-lg font-semibold text-gray-900 pt-4">1. Kitchen Dimensions & Visualizations</h2>
          <p>
            The 3D Planner provides accurate interactive representations for planning and spatial visualization. Final installation measurements should always be verified on site before production.
          </p>
          <h2 className="text-lg font-semibold text-gray-900 pt-4">2. Cookies & Local Storage</h2>
          <p>
            We use essential cookies and browser storage to maintain session states, room layout coordinates, selected cabinetry, and items placed in the shopping cart.
          </p>
          <h2 className="text-lg font-semibold text-gray-900 pt-4">3. Quotations & Ordering</h2>
          <p>
            All prices and delivery estimates provided during checkout are verified and confirmed by our customer support team upon formal order placement.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
