import React from 'react';
import Navbar from '../Components/Navbar';

const UserManual = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 prose prose-green max-w-none">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-8 border-b pb-4">Agri-Assist: User Manual</h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Welcome to the Agri-Assist platform! This user manual provides a comprehensive guide on how to navigate and use the features of the application.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Table of Contents</h2>
            <ul className="space-y-2 mb-8 text-green-700 font-medium">
              <li><a href="#introduction" className="hover:text-green-800 transition-colors">1. Introduction</a></li>
              <li><a href="#user-roles" className="hover:text-green-800 transition-colors">2. User Roles</a></li>
              <li><a href="#getting-started" className="hover:text-green-800 transition-colors">3. Getting Started</a></li>
              <li><a href="#key-features" className="hover:text-green-800 transition-colors">4. Key Features</a></li>
              <li><a href="#seller-guidelines" className="hover:text-green-800 transition-colors">5. Seller Guidelines</a></li>
              <li><a href="#admin-dashboard" className="hover:text-green-800 transition-colors">6. Admin Dashboard</a></li>
            </ul>

            <h2 id="introduction" className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pt-6 border-t border-gray-100">Introduction</h2>
            <p className="text-gray-600 mb-6">
              Agri-Assist is an AI-powered agricultural marketplace and assistance platform. It connects farmers, agricultural experts, and buyers while providing smart tools like crop disease detection and tailored recommendations.
            </p>

            <h2 id="user-roles" className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pt-6 border-t border-gray-100">User Roles</h2>
            <ul className="list-disc pl-6 space-y-3 text-gray-600 mb-6 marker:text-green-500">
              <li><strong className="text-gray-800">Buyer/Standard User:</strong> Can browse products, add items to the cart, make purchases, use AI tools, and participate in forums.</li>
              <li><strong className="text-gray-800">Seller (Farmer/Vendor):</strong> Can list products, manage inventory, process orders, and communicate with buyers.</li>
              <li><strong className="text-gray-800">Admin:</strong> Manages platform health, oversees users/sellers, processes verification, and monitors platform statistics.</li>
            </ul>

            <h2 id="getting-started" className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pt-6 border-t border-gray-100">Getting Started</h2>
            <ol className="list-decimal pl-6 space-y-3 text-gray-600 mb-6 marker:text-green-500">
              <li><strong className="text-gray-800">Registration:</strong> Create an account by providing basic details. To become a seller, you may need to complete an extended profile (including citizenship verification).</li>
              <li><strong className="text-gray-800">Login:</strong> Use your credentials to log in and access your personalized dashboard.</li>
            </ol>

            <h2 id="key-features" className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pt-6 border-t border-gray-100">Key Features</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-xl font-medium text-gray-800 mb-3">Authentication & Profile</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li><strong className="text-gray-800">Account Creation/Login:</strong> Secure access to your account.</li>
                  <li><strong className="text-gray-800">Profile Management:</strong> Update personal details and notification preferences.</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-xl font-medium text-gray-800 mb-3">Marketplace (Products & Cart)</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li><strong className="text-gray-800">Browse & Search:</strong> Find agricultural products, filter by categories.</li>
                  <li><strong className="text-gray-800">Wishlist:</strong> Save products you are interested in for later.</li>
                  <li><strong className="text-gray-800">Cart & Checkout:</strong> Add items to your cart and proceed to secure checkout (Khalti supported).</li>
                  <li><strong className="text-gray-800">Order Tracking:</strong> Track your order status in real-time under "My Orders".</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-xl font-medium text-gray-800 mb-3">AI Features (Detection & Recommendation)</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li><strong className="text-gray-800">Crop Disease Detection:</strong> Upload images of your crops to identify potential diseases.</li>
                  <li><strong className="text-gray-800">Recommendations:</strong> Get tailored agricultural insight to optimize your yield.</li>
                </ul>
              </div>
            </div>

            <h2 id="seller-guidelines" className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pt-6 border-t border-gray-100">Seller Guidelines</h2>
            <ul className="list-disc pl-6 space-y-3 text-gray-600 mb-6 marker:text-green-500">
              <li><strong className="text-gray-800">Dashboard Overview:</strong> Monitor your active listings, pending orders, and sales.</li>
              <li><strong className="text-gray-800">Product Management:</strong> Add new products, update pricing, and set stock quantities.</li>
              <li><strong className="text-gray-800">Order Fulfillment:</strong> Update status (Shipped, Delivered) and manage communications.</li>
            </ul>

            <h2 id="admin-dashboard" className="text-2xl font-semibold text-gray-800 mt-10 mb-4 pt-6 border-t border-gray-100">Admin Dashboard</h2>
            <ul className="list-disc pl-6 space-y-3 text-gray-600 mb-6 marker:text-green-500">
              <li><strong className="text-gray-800">User Management:</strong> Oversee all buyer and seller accounts and verifications.</li>
              <li><strong className="text-gray-800">Moderation:</strong> Monitor forum posts and testimonials.</li>
              <li><strong className="text-gray-800">Analytics:</strong> View total sales, revenue, and active sessions.</li>
            </ul>

          </div>
        </div>
      </div>
    </>
  );
};

export default UserManual;