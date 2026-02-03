import React, { useState } from 'react';
import { Search, Eye, XCircle, Check } from 'lucide-react';

const SellersView = ({ sellers, filterStatus, setFilterStatus, handleSellerAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sellers Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage sellers and their commissions</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sellers.filter(seller => 
          (filterStatus === 'all' || seller.status === filterStatus) &&
          (seller.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           seller.email.toLowerCase().includes(searchTerm.toLowerCase()))
        ).map((seller) => (
          <div key={seller.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
            <div className={`h-2 ${seller.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {seller.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{seller.name}</h3>
                    <p className="text-xs text-gray-500">{seller.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Products</span>
                  <span className="font-bold text-gray-900">{seller.products}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Sales</span>
                  <span className="font-bold text-gray-900">₹{seller.totalSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Commission Paid</span>
                  <span className="font-bold text-green-600">₹{seller.commission.toLocaleString()}</span>
                </div>
                {seller.rating > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rating</span>
                    <span className="font-bold text-yellow-600">⭐ {seller.rating}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  seller.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {seller.status}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedSeller(seller)}
                    className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-lg transition-colors">
                    View Details
                  </button>
                  {seller.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleSellerAction(seller.id, 'active')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleSellerAction(seller.id, 'rejected')}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {seller.status === 'active' && (
                    <button 
                      onClick={() => handleSellerAction(seller.id, 'blocked')}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Block
                    </button>
                  )}
                  {seller.status === 'blocked' && (
                    <button 
                      onClick={() => handleSellerAction(seller.id, 'active')}
                      className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Unblock
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seller Details Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">Seller Details</h3>
              <button 
                onClick={() => setSelectedSeller(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="flex gap-6 items-start">
                 <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg shrink-0">
                    {selectedSeller.name.charAt(0)}
                 </div>
                 <div className="space-y-2">
                   <h2 className="text-2xl font-bold text-gray-900">{selectedSeller.name}</h2>
                   <div className="flex flex-wrap gap-2">
                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        selectedSeller.status === 'active' ? 'bg-green-100 text-green-700' : 
                        selectedSeller.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedSeller.status.toUpperCase()}
                      </span>
                      {selectedSeller.businessType && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          {selectedSeller.businessType}
                        </span>
                      )}
                   </div>
                   <p className="text-gray-600">{selectedSeller.storeDescription || 'No description provided.'}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Email</p>
                      <p className="text-sm font-medium">{selectedSeller.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Phone</p>
                      <p className="text-sm font-medium">{selectedSeller.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Address</p>
                      <p className="text-sm font-medium">{selectedSeller.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Total Products</p>
                      <p className="font-bold text-gray-900">{selectedSeller.products}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Total Sales</p>
                      <p className="font-bold text-gray-900">₹{selectedSeller.totalSales.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Total Commission</p>
                      <p className="font-bold text-green-600">₹{selectedSeller.commission.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Joined Date</p>
                      <p className="font-medium text-gray-900">{selectedSeller.joinDate}</p>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="col-span-1 md:col-span-2 p-4 bg-gray-50 rounded-xl space-y-3">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">Documents</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-2">Citizenship Front</p>
                      {selectedSeller.citizenship?.front ? (
                        <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden border border-gray-200 group">
                          <img 
                            src={`http://localhost:5000/${selectedSeller.citizenship.front.replace(/\\/g, '/').replace('public/', '')}`} 
                            alt="Citizenship Front" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(`http://localhost:5000/${selectedSeller.citizenship.front.replace(/\\/g, '/').replace('public/', '')}`, '_blank')}
                            onError={(e) => {e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'}}
                          />
                        </div>
                      ) : (
                        <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm italic">
                          No Image Uploaded
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-2">Citizenship Back</p>
                      {selectedSeller.citizenship?.back ? (
                        <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden border border-gray-200 group">
                           <img 
                            src={`http://localhost:5000/${selectedSeller.citizenship.back.replace(/\\/g, '/').replace('public/', '')}`} 
                            alt="Citizenship Back" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(`http://localhost:5000/${selectedSeller.citizenship.back.replace(/\\/g, '/').replace('public/', '')}`, '_blank')}
                            onError={(e) => {e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'}}
                          />
                        </div>
                      ) : (
                        <div className="h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm italic">
                          No Image Uploaded
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setSelectedSeller(null)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellersView;
