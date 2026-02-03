import React, { useState, useEffect } from 'react';
import { 
   Lock, Shield, Loader2, ArrowRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import LocationPicker from '../components/LocationPicker';
import { MapPin } from 'lucide-react';

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [fetchingCart, setFetchingCart] = useState(true);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchCartTotal();
  }, []);

  const fetchCartTotal = async () => {
    try {
        const response = await api.get('/cart');
        if (response.data.success) {
            const subtotal = response.data.data.totalAmount;
            const total = Math.round(subtotal * 1.18);
            setCartTotal(total);
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
    } finally {
        setFetchingCart(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
        // 1. Call backend to initiate payment and get params
        console.log('Initiating payment with location:', location);
        const response = await api.post('/esewa/initiate', { location });
        
        console.log('Payment initiation response:', response.data);
        
        if (response.data.success) {
            const { paymentParams } = response.data;
            
            console.log('Creating form with params:', paymentParams);
            
            // Check if this is mock eSewa (frontend route) or real eSewa (external server)
            const isMockEsewa = paymentParams.esewa_url.includes('localhost') || 
                                paymentParams.esewa_url.includes('mock-esewa-payment');
            
            if (isMockEsewa) {
                // For mock eSewa: Use GET redirect with query parameters
                console.log('Using mock eSewa - redirecting with query params');
                const queryParams = new URLSearchParams();
                
                for (const key in paymentParams) {
                    if (key !== 'esewa_url') {
                        queryParams.append(key, paymentParams[key]);
                    }
                }
                
                const redirectUrl = `${paymentParams.esewa_url}?${queryParams.toString()}`;
                console.log('Redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
            } else {
                // For real eSewa: Use POST form submission
                console.log('Using real eSewa - submitting POST form');
                const form = document.createElement("form");
                form.setAttribute("method", "POST");
                form.setAttribute("action", paymentParams.esewa_url);

                // Add all payment parameters as hidden fields
                for (const key in paymentParams) {
                    if (key !== 'esewa_url') {
                        const hiddenField = document.createElement("input");
                        hiddenField.setAttribute("type", "hidden");
                        hiddenField.setAttribute("name", key);
                        hiddenField.setAttribute("value", paymentParams[key]);
                        form.appendChild(hiddenField);
                        console.log(`Added field: ${key} = ${paymentParams[key]}`);
                    }
                }

                document.body.appendChild(form);
                console.log('Submitting form to:', paymentParams.esewa_url);
                form.submit();
            }
        }
    } catch (error) {
        console.error('Payment Initiation Error:', error);
        console.error('Error details:', error.response?.data);
        alert('Failed to initiate payment. Please try again.');
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 bg-[#41A124] text-white flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                <Lock className="text-white" size={20} />
                eSewa Secure Payment
                </h1>
                <p className="text-white/80 text-sm mt-1">Merchant: AgriAssist Nepal</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
                <span className="text-xs font-bold block opacity-80">TOTAL TO PAY</span>
                <span className="text-xl font-bold">Rs. {fetchingCart ? '...' : cartTotal}</span>
            </div>
          </div>

          <div className="p-8 md:p-12 text-center">
            <div className="w-32 h-12 bg-contain bg-no-repeat bg-center mx-auto mb-8" 
                 style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/f/f5/Esewa_logo.webp')" }}>
                <span className="sr-only">eSewa</span>
            </div>

            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                You will be redirected to the eSewa website to securely complete your payment.
            </p>

            <div className="text-left mb-8">
                <div className="flex items-center gap-2 mb-2 font-bold text-gray-700">
                    <MapPin size={20} className="text-green-600" />
                    Confirm Delivery Location
                </div>
                <LocationPicker onLocationSelect={setLocation} />
                {location ? (
                    <p className="text-xs text-green-600 mt-2 font-semibold">
                       Selected: {location.address}
                    </p>
                ) : (
                    <p className="text-xs text-red-500 mt-2 font-semibold">
                       * Please pin your delivery location on the map
                    </p>
                )}
            </div>

            <button 
                onClick={handlePayment}
                disabled={loading || fetchingCart || !location}
                className="w-full max-w-xs mx-auto py-4 bg-[#41A124] hover:bg-[#36851e] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
                {loading ? 'Redirecting...' : 'Pay via eSewa'}
                {!loading && <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-8 pt-6 border-t border-gray-100">
              <Shield size={12} />
              Secured by eSewa | PCI-DSS Compliant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
