import React from 'react';
import { Search, Eye, XCircle, Check } from 'lucide-react';

const UsersView = ({ users, searchTerm, setSearchTerm, filterStatus, setFilterStatus, handleUserAction }) => {
  const [selectedUser, setSelectedUser] = React.useState(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all registered users</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search users..."
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
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Email</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Join Date</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Orders</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Total Spent</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(user => 
                (user.role === 'user') &&
                (filterStatus === 'all' || user.status === filterStatus) &&
                (user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 user.email.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{user.joinDate}</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">{user.orders}</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">₹{user.spent.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="View Details"
                      >
                        <Eye size={18} className="text-blue-600" />
                      </button>
                      {user.status === 'active' ? (
                        <button 
                          onClick={() => handleUserAction(user.id, 'block')}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Block User"
                        >
                          <XCircle size={18} className="text-red-600" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors" 
                          title="Activate User"
                        >
                          <Check size={18} className="text-green-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">User Details</h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-center mb-6">
                 <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {selectedUser.name.charAt(0)}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                    selectedUser.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Join Date</p>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.joinDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Role</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{selectedUser.role}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Total Orders</p>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.orders}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Total Spent</p>
                  <p className="text-sm font-medium text-gray-900">₹{selectedUser.spent.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)}
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

export default UsersView;
