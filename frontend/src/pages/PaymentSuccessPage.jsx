import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();
  const verificationCalled = useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
      // Prevent duplicate calls (React StrictMode causes double mounting in dev)
      if (verificationCalled.current) {
        console.log('Verification already called, skipping...');
        return;
      }
      
      verificationCalled.current = true;

      try {
        const data = searchParams.get('data');
        if (!data) {
             setStatus('failed');
             return;
        }

        console.log('Calling payment verification API...');
        const response = await api.get(`/esewa/verify?data=${data}`);
        
        if (response.data.success) {
            setStatus('success');
            setTimeout(() => navigate('/home'), 3000);
        } else {
            setStatus('failed');
        }
      } catch (error) {
        console.error('Verification Error:', error);
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            {status === 'verifying' && (
                <>
                    <Loader2 className="animate-spin text-green-600 mx-auto mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-900">Verifying Payment...</h2>
                    <p className="text-gray-500 mt-2">Please wait while we confirm your transaction.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
                    <p className="text-gray-500 mt-2">Your order has been placed successfully.</p>
                    <p className="text-sm text-gray-400 mt-4">Redirecting to Home...</p>
                </>
            )}

            {status === 'failed' && (
                <>
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <XCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Payment Failed</h2>
                    <p className="text-gray-500 mt-2">We couldn't verify your payment. Please contact support if you were charged.</p>
                    <button 
                        onClick={() => navigate('/cart')}
                        className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
                    >
                        Return to Cart
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
