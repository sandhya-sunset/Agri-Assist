import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import { XCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentFailurePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Log all query parameters for debugging
    console.log('=== Payment Failure Page ===');
    console.log('All query params:', Object.fromEntries(searchParams.entries()));
    
    // Check if eSewa returned any data
    const data = searchParams.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        console.log('Decoded eSewa data:', decoded);
      } catch (e) {
        console.log('Could not decode data:', e);
      }
    }
  }, [searchParams]);

  const errorMessage = searchParams.get('message') || 'You cancelled the transaction or it failed.';
  const hasQueryParams = searchParams.toString().length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-80px)] px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <XCircle size={32} />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>

            {hasQueryParams && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">
                      Debugging Information
                    </p>
                    <p className="text-xs text-yellow-700 break-all">
                      {searchParams.toString()}
                    </p>
                    <p className="text-xs text-yellow-600 mt-2">
                      Check browser console for detailed logs
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={() => navigate('/cart')}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                Return to Cart & Try Again
              </button>
              
              <button 
                onClick={() => navigate('/home')}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Go to Home
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Need help? Contact support at{' '}
                <a href="mailto:support@agriassist.com" className="text-green-600 font-semibold">
                  support@agriassist.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;

