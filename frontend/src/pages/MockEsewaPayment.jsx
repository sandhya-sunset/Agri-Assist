import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';

/**
 * Mock eSewa Payment Page
 * This simulates the eSewa payment gateway for development/testing
 * when the real eSewa test server is down
 */
const MockEsewaPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    // Extract payment parameters from URL or form data
    const params = {
      amount: searchParams.get('amount'),
      tax_amount: searchParams.get('tax_amount'),
      total_amount: searchParams.get('total_amount'),
      transaction_uuid: searchParams.get('transaction_uuid'),
      product_code: searchParams.get('product_code'),
      success_url: searchParams.get('success_url'),
      failure_url: searchParams.get('failure_url'),
      signature: searchParams.get('signature')
    };

    setPaymentInfo(params);
  }, [searchParams]);

  const handleSuccess = () => {
    setProcessing(true);
    
    // Simulate eSewa processing delay
    setTimeout(() => {
      // Create mock eSewa response
      const mockResponse = {
        transaction_code: `TXN${Date.now()}`,
        status: 'COMPLETE',
        total_amount: paymentInfo.total_amount,
        transaction_uuid: paymentInfo.transaction_uuid,
        product_code: paymentInfo.product_code,
        signed_field_names: 'transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names'
      };

      // Encode response as base64 (like eSewa does)
      const encodedData = btoa(JSON.stringify(mockResponse));
      
      // Redirect to success URL with data
      const successUrl = `${paymentInfo.success_url}?data=${encodedData}`;
      window.location.href = successUrl;
    }, 2000);
  };

  const handleFailure = () => {
    setProcessing(true);
    
    setTimeout(() => {
      const mockResponse = {
        transaction_code: `TXN${Date.now()}`,
        status: 'FAILED',
        total_amount: paymentInfo.total_amount,
        transaction_uuid: paymentInfo.transaction_uuid,
        product_code: paymentInfo.product_code
      };

      const encodedData = btoa(JSON.stringify(mockResponse));
      const failureUrl = `${paymentInfo.failure_url}?data=${encodedData}`;
      window.location.href = failureUrl;
    }, 2000);
  };

  if (!paymentInfo || !paymentInfo.transaction_uuid) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-xl font-bold text-orange-600 mb-4">Mock eSewa Payment Page</h1>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>✓ Mock eSewa is enabled!</strong>
            </p>
            <p className="text-xs text-blue-700 mt-2">
              This page is working correctly. You just need to access it through the payment flow.
            </p>
          </div>
          <div className="text-gray-700 space-y-3">
            <p className="font-semibold">How to test:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to your cart page</li>
              <li>Click "Proceed to Payment"</li>
              <li>Select delivery location</li>
              <li>Click "Pay via eSewa"</li>
              <li>You'll be redirected here with payment details</li>
            </ol>
          </div>
          <div className="mt-6">
            <a 
              href="/cart" 
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-bold py-3 rounded-lg transition-all"
            >
              Go to Cart
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#60BB46] p-6 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">eSewa Mock Payment</h1>
            <div className="bg-white/20 px-3 py-1 rounded text-xs font-semibold">
              TEST MODE
            </div>
          </div>
          <p className="text-sm mt-1 opacity-90">Development/Testing Environment</p>
        </div>

        {/* Payment Details */}
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a mock payment page for development. 
              The real eSewa test server is currently unavailable (502 error).
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-blue-900 mb-2">eSewa Test Credentials (for reference):</p>
            <div className="text-xs text-blue-800 space-y-1 font-mono">
              <div><strong>eSewa ID:</strong> 9806800001</div>
              <div><strong>Password:</strong> Nepal@123</div>
              <div><strong>MPIN:</strong> 1122</div>
              <div><strong>Token:</strong> 123456</div>
            </div>
            <p className="text-xs text-blue-600 mt-2 italic">
              (These credentials are for the real eSewa test server. This mock page doesn't require login.)
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Transaction ID</label>
              <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                {paymentInfo.transaction_uuid}
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-500">Product Code</label>
              <p className="font-semibold">{paymentInfo.product_code}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold">Rs. {paymentInfo.amount}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">Rs. {paymentInfo.tax_amount}</span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-green-600">
                  Rs. {paymentInfo.total_amount}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleSuccess}
              disabled={processing}
              className="w-full bg-[#60BB46] hover:bg-[#4fa837] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Simulate Successful Payment
                </>
              )}
            </button>

            <button
              onClick={handleFailure}
              disabled={processing}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50"
            >
              Simulate Failed Payment
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            This mock page will redirect you back to your application
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockEsewaPayment;
