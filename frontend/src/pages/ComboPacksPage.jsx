import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import { Package, ArrowRight, ShoppingCart, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../Services/api";
import { useToast } from "../Components/Toast";

const ComboPacksPage = () => {
  const navigate = useNavigate();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const handleAddToCart = async (e, dealId) => {
    e.stopPropagation();
    try {
      await api.post("/cart", { dealId, quantity: 1 });
      addToast("Combo deal added to cart successfully!", "success");
      navigate("/cart");
    } catch (error) {
      addToast("Failed to add combo to cart", "error");
    }
  };

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const response = await api.get("/deals/active");
        if (response.data.success) {
          // Filter to only show actual "combos" (deals with > 1 image or badge 'combo')
          const comboDeals = response.data.data.filter(
             deal => (deal.images && deal.images.length > 1) || deal.title.toLowerCase().includes('combo')
          );
          setCombos(comboDeals);
        }
      } catch (error) {
        console.error("Failed to fetch combo deals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  // Dummy fallback if no deals
  const dummyCombos = [
    {
      _id: "dummy1",
      title: "Complete Wheat Setup",
      subtitle: "Includes high-yield wheat seeds, NPK 10-26-26 fertilizer.",
      images: ["https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&h=400&fit=crop"],
      badge: "Save Rs. 500",
    },
    {
      _id: "dummy2",
      title: "Organic Vegetable Starter",
      subtitle: "Mix of seasonal vegetable seeds + 10kg premium compost.",
      images: ["https://images.unsplash.com/photo-1595841696677-6489ff81bc33?w=600&h=400&fit=crop"],
      badge: "Save Rs. 350",
    }
  ];

  const displayCombos = combos.length > 0 ? combos : dummyCombos;

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
        
        {loading ? (
          <div className="flex justify-center py-12">
             <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-600"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCombos.map((combo) => {
              const hasMultipleImages = combo.images && combo.images.length > 1;
              const displayImage = hasMultipleImages ? null : (combo.image || (combo.images && combo.images[0]));
              
              return (
                <div key={combo._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:border-red-300 hover:shadow-xl transition-all group flex flex-col">
                  {/* Dynamic Combo Image Rendering */}
                  {hasMultipleImages ? (
                    <div className="relative h-56 bg-gray-50 flex items-center justify-center p-4 border-b border-gray-100">
                        {/* Red Ribbon */}
                        <div className="absolute z-30 bg-red-600 text-white text-[10px] font-bold px-5 py-1 uppercase tracking-wider transform -rotate-6 top-[40%] md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg">
                          Combo Offer
                        </div>

                        {/* Side-by-side images */}
                        <div className="flex items-center justify-center w-full z-10 gap-2">
                          {combo.images.slice(0, 2).map((img, i) => (
                            <div 
                              key={i} 
                              className={`w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-xl shadow-sm border border-gray-100 p-2 transform transition-transform duration-500 group-hover:scale-105 z-20 ${i === 0 ? '-rotate-6' : 'rotate-6'}`}
                            >
                              <img
                                src={img}
                                alt={`${combo.title} item ${i + 1}`}
                                className="w-full h-full object-contain drop-shadow-sm"
                              />
                            </div>
                          ))}
                        </div>
                        
                        {(combo.badge || combo.savings) && (
                          <div className="absolute top-4 left-4 z-40 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                            {combo.badge || combo.savings}
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="relative h-56 overflow-hidden bg-gray-100 border-b border-gray-100 p-4">
                      {displayImage && (
                        <img 
                          src={displayImage} 
                          alt={combo.title} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      {(combo.badge || combo.savings) && (
                        <div className="absolute top-4 left-4 z-40 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {combo.badge || combo.savings}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{combo.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{combo.subtitle || combo.description}</p>
                    
                    {/* Deal pricing if available */}
                    <div className="flex flex-col gap-1 mb-6">
                       {combo.price ? (
                         <div className="flex items-end gap-3">
                           <span className="text-2xl font-bold text-green-600">Rs. {combo.price}</span>
                           {combo.originalPrice && <span className="text-gray-400 line-through text-sm mb-1">Rs. {combo.originalPrice}</span>}
                         </div>
                       ) : (
                         <div className="flex items-center gap-1 text-sm font-semibold text-green-700">
                            <CheckCircle2 size={16} /> Best Value Assured
                         </div>
                       )}
                    </div>

                    <button 
                      onClick={(e) => {
                        // If it's a generic link or undefined, add combo to cart, else go to link
                        if (!combo.link || combo.link.trim() === "" || combo.link === "/products") {
                          handleAddToCart(e, combo._id);
                        } else {
                          navigate(combo.link);
                        }
                      }}
                      className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 mt-auto"
                    >
                      <ShoppingCart size={18} />
                      {(!combo.link || combo.link.trim() === "" || combo.link === "/products") ? 'Add Combo to Cart' : 'Shop the Deal'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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