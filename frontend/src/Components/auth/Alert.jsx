import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

function Alert({ type, message, onClose }) {
  const isError = type === 'error';
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl mb-4 ${
      isError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
    }`}>
      {isError ? (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className={`text-sm font-medium ${isError ? 'text-red-800' : 'text-green-800'}`}>
          {message}
        </p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        ×
      </button>
    </div>
  );
}

export default Alert;
