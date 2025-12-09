import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import Header from '../component/Header';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-[#16533A] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">There is no such thing.</h2>
          <p className="text-gray-600 mb-8">
            But there are many more.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#16533A] text-white rounded-lg hover:bg-[#16533A]/90 transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              Go to Home Page
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
