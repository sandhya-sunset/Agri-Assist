import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

// ─── Card layout — defined OUTSIDE the main component so it never remounts ───
// If defined inside MockEsewaPayment, React would treat it as a new component
// type on every re-render (because the function reference changes), causing
// unmount → remount → autoFocus retriggers → focus jumps to eSewa ID field.
const Card = ({ totalAmount, children }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
      {/* Header */}
      <div className="bg-[#60BB46] p-5 text-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">eSewa</h1>
          <p className="text-xs opacity-80 mt-0.5">Mock Payment · Test Mode</p>
        </div>
        <span className="bg-white/20 px-3 py-1 rounded text-xs font-semibold">
          TEST MODE
        </span>
      </div>

      {/* Amount summary strip */}
      <div className="bg-green-50 border-b border-green-100 px-6 py-3 flex items-center justify-between">
        <span className="text-sm text-gray-600">Total Amount</span>
        <span className="text-xl font-bold text-green-600">
          Rs. {totalAmount}
        </span>
      </div>

      <div className="p-6">{children}</div>
    </div>
  </div>
);

/**
 * Mock eSewa Payment Page
 * Simulates the eSewa payment gateway for development/testing.
 * Customers can enter any test credentials to proceed.
 */
const MockEsewaPayment = () => {
  const [searchParams] = useSearchParams();

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [step, setStep] = useState("login"); // 'login' | 'mpin' | 'processing'

  // Form fields
  const [esewaId, setEsewaId] = useState("");
  const [password, setPassword] = useState("");
  const [mpin, setMpin] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validation
  const [error, setError] = useState("");

  // Ref for focusing eSewa ID on mount — avoids autoFocus prop which
  // can retrigger if the component tree changes
  const esewaIdRef = useRef(null);

  useEffect(() => {
    const params = {
      amount: searchParams.get("amount"),
      tax_amount: searchParams.get("tax_amount"),
      total_amount: searchParams.get("total_amount"),
      transaction_uuid: searchParams.get("transaction_uuid"),
      product_code: searchParams.get("product_code"),
      success_url: searchParams.get("success_url"),
      failure_url: searchParams.get("failure_url"),
      signature: searchParams.get("signature"),
    };
    setPaymentInfo(params);
  }, [searchParams]);

  // Focus eSewa ID input once when the login step first appears
  useEffect(() => {
    if (step === "login" && esewaIdRef.current) {
      esewaIdRef.current.focus();
    }
  }, [step]);

  // Step 1: Validate eSewa ID + Password
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!esewaId.trim()) {
      setError("Please enter your eSewa ID.");
      return;
    }
    if (esewaId.trim().length < 7) {
      setError("eSewa ID must be at least 7 characters.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }
    if (password.trim().length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setStep("mpin");
  };

  // Step 2: Validate MPIN and trigger payment
  const handleMpinSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!mpin.trim()) {
      setError("Please enter your MPIN.");
      return;
    }
    if (!/^\d{4,6}$/.test(mpin.trim())) {
      setError("MPIN must be 4–6 digits.");
      return;
    }

    handleSimulateSuccess();
  };

  const handleSimulateSuccess = () => {
    setStep("processing");

    setTimeout(() => {
      const mockResponse = {
        transaction_code: `TXN${Date.now()}`,
        status: "COMPLETE",
        total_amount: paymentInfo.total_amount,
        transaction_uuid: paymentInfo.transaction_uuid,
        product_code: paymentInfo.product_code,
        signed_field_names:
          "transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names",
      };

      const encodedData = btoa(JSON.stringify(mockResponse));
      window.location.href = `${paymentInfo.success_url}?data=${encodedData}`;
    }, 2000);
  };

  const handleCancel = () => {
    if (!paymentInfo) return;
    const mockResponse = {
      transaction_code: `TXN${Date.now()}`,
      status: "FAILED",
      total_amount: paymentInfo.total_amount,
      transaction_uuid: paymentInfo.transaction_uuid,
      product_code: paymentInfo.product_code,
    };
    const encodedData = btoa(JSON.stringify(mockResponse));
    window.location.href = `${paymentInfo.failure_url}?data=${encodedData}`;
  };

  // ─── No payment info (accessed directly) ────────────────────────────────────
  if (!paymentInfo || !paymentInfo.transaction_uuid) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-xl font-bold text-[#60BB46] mb-4">
            eSewa Mock Payment
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <p className="text-sm text-blue-800 font-semibold">
              ✓ Mock eSewa is enabled!
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Access this page through the payment flow to test.
            </p>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Go to your cart page</li>
            <li>Click "Proceed to Payment"</li>
            <li>Select delivery location</li>
            <li>Click "Pay via eSewa"</li>
          </ol>
          <a
            href="/cart"
            className="block w-full mt-6 bg-[#60BB46] hover:bg-[#4fa837] text-white text-center font-bold py-3 rounded-lg transition-all"
          >
            Go to Cart
          </a>
        </div>
      </div>
    );
  }

  // ─── Processing screen ───────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 flex flex-col items-center gap-5">
          <Loader2 className="animate-spin text-[#60BB46]" size={52} />
          <p className="text-lg font-semibold text-gray-700">
            Processing your payment…
          </p>
          <p className="text-sm text-gray-400">
            Please wait, do not close this window.
          </p>
        </div>
      </div>
    );
  }

  // ─── MPIN step ───────────────────────────────────────────────────────────────
  if (step === "mpin") {
    return (
      <Card totalAmount={paymentInfo.total_amount}>
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="text-[#60BB46]" size={22} />
          <h2 className="text-base font-semibold text-gray-800">
            Enter your MPIN
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Logged in as{" "}
          <span className="font-semibold text-gray-700">{esewaId}</span>
        </p>

        <form
          onSubmit={handleMpinSubmit}
          className="space-y-5"
          autoComplete="off"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MPIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={mpin}
              onChange={(e) => {
                setMpin(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              placeholder="Enter 4–6 digit MPIN"
              autoComplete="off"
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#60BB46] tracking-widest text-center text-lg"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#60BB46] hover:bg-[#4fa837] text-white font-bold py-3.5 rounded-xl transition-all text-sm"
          >
            Pay Rs. {paymentInfo.total_amount}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("login");
              setError("");
              setMpin("");
            }}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl transition-all text-sm border border-red-200"
          >
            Cancel Payment
          </button>
        </form>
      </Card>
    );
  }

  // ─── Login step (default) ────────────────────────────────────────────────────
  return (
    <Card totalAmount={paymentInfo.total_amount}>
      <h2 className="text-base font-semibold text-gray-800 mb-1">
        Login to eSewa
      </h2>
      <p className="text-xs text-gray-400 mb-6">
        Use any test credentials you like — this is a mock environment.
      </p>

      <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
        {/* eSewa ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            eSewa ID
          </label>
          <input
            ref={esewaIdRef}
            type="text"
            value={esewaId}
            onChange={(e) => {
              setEsewaId(e.target.value);
              setError("");
            }}
            placeholder="e.g. 9806800001"
            autoComplete="off"
            name="esewa-mock-id"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#60BB46]"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              autoComplete="off"
              name="esewa-mock-pwd"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#60BB46]"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Transaction info */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Transaction ID</span>
            <span className="font-mono truncate max-w-[180px]">
              {paymentInfo.transaction_uuid}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Product Code</span>
            <span className="font-semibold">{paymentInfo.product_code}</span>
          </div>
          <div className="flex justify-between border-t pt-1 mt-1">
            <span>Amount</span>
            <span>Rs. {paymentInfo.amount}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>Rs. {paymentInfo.tax_amount}</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#60BB46] hover:bg-[#4fa837] text-white font-bold py-3.5 rounded-xl transition-all text-sm"
        >
          Login &amp; Continue
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl transition-all text-sm border border-red-200"
        >
          Cancel Payment
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-5">
        🔒 This is a mock page — any credentials will work
      </p>
    </Card>
  );
};

export default MockEsewaPayment;
