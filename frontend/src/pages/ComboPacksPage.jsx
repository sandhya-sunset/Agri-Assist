import React from "react";
import Navbar from "../Components/Navbar";
import { Package, ArrowRight, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ComboPacksPage = () => {
  const navigate = useNavigate();

  // Dummy combo pack data for demonstration
  const dummyCombos = [
    {
      id: 1,
      title: "Complete Wheat Setup",
      description: "Includes high-yield wheat seeds, NPK 10-26-26 fertilizer, and basic farming tools.",
      price: 1500,
      originalPrice: 2000,
      image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&h=400&fit=crop",
      savings: "Save Rs. 500",
    },
    {
      id: 2,
      title: "Organic Vegetable Starter",
      description: "A mix of seasonal vegetable seeds along with 10kg premium organic compost.",
      price: 850,
      originalPrice: 1200,
      image: "https://images.unsplash.com/photo-1595841696677-6489ff81bc33?w=600&h=400&fit=crop",
      savings: "Save Rs. 350",
    },
    {
      id: 3,
      title: "Pesticide & Fertilizer Duo",
      description: "Our top-selling eco-friendly pesticide paired with growth-boosting fertilizer.",
      price: 2100,
      originalPrice: 2600,
      image: "https://images.unsplash.com/photo-1585822765365-5c918342ca02?w=600&h=400&fit=crop",
      savings: "Save Rs. 500",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Banner Section */}
        <div className="bg-linear-to-r from-blue-500 to-purple-600 rounded-3xl p-8 md:p-12 mb-12 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Package size={18} className="text-white" />
              <span className="text-sm font-bold tracking-wider uppercase text-white">
                Best Value Deals
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Combo Packs</h1>
            <p className="text-xl text-blue-100 mb-8">
              Maximize your yield and minimize your costs. Buy our expertly curated bundles and save BIG compared to buying individually.
            </p>
          </div>
          {/* Decorative background circle */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Dummy Products Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Bundles</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dummyCombos.map((combo) => (
            <div key={combo.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={combo.image} 
                  alt={combo.title} 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {combo.savings}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{combo.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{combo.description}</p>
                
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-2xl font-bold text-green-600">Rs. {combo.price}</span>
                  <span className="text-gray-400 line-through text-sm mb-1">Rs. {combo.originalPrice}</span>
                </div>

                <button 
                  onClick={() => alert("This is a dummy page! You can attach this button to your real cart system later.")}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Add Combo to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Return Button */}
        <div className="mt-12 text-center">
          <button 
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors"
          >
            Explore all individual products <ArrowRight size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ComboPacksPage;