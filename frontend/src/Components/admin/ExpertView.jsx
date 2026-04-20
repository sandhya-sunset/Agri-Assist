import React, { useState, useEffect } from "react";
import { Search, Eye, XCircle, Check, UserCheck } from "lucide-react";
import api from "../../Services/api";
import { toast } from "react-hot-toast";

const ExpertView = () => {
  const [experts, setExperts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/expert-applications?status=${filterStatus === "all" ? "" : filterStatus}`);
      if (response.data.success) {
        setExperts(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching expert applications:", error);
      toast.error("Failed to load expert applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, [filterStatus]);

  const handleAction = async (id, action) => {
    try {
      const endpoint = `/admin/expert-applications/${id}/${action}`;
      const response = await api.put(endpoint);
      if (response.data.success) {
        toast.success(`Application ${action}d successfully`);
        setSelectedExpert(null);
        fetchExperts();
      }
    } catch (error) {
      console.error(`Error ${action} application:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} application`);
    }
  };

  const filteredExperts = experts.filter((e) =>
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.expertDetails?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Expert Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage agricultural expert applications
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search experts..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
             <div className="h-64 flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
             </div>
          ) : filteredExperts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
               No applications found.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 text-gray-500 text-sm">
                    <tr>
                      <th className="px-6 py-4 font-medium text-left">Applicant</th>
                      <th className="px-6 py-4 font-medium text-left">Specialization</th>
                      <th className="px-6 py-4 font-medium text-left">Experience</th>
                      <th className="px-6 py-4 font-medium text-left">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredExperts.map((expert) => (
                      <tr key={expert._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{expert.name}</div>
                          <div className="text-sm text-gray-500">{expert.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{expert.expertDetails?.specialization}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">{expert.expertDetails?.experienceYears} years</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            expert.expertApplicationStatus === "approved"
                              ? "bg-green-50 text-green-700"
                              : expert.expertApplicationStatus === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}>
                            {expert.expertApplicationStatus?.charAt(0).toUpperCase() + expert.expertApplicationStatus?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedExpert(expert)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedExpert ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Applicant Details</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium text-gray-900">{selectedExpert.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">{selectedExpert.email}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium text-gray-900">{selectedExpert.phone || 'N/A'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Address</div>
                  <div className="font-medium text-gray-900">
                    {[selectedExpert.address?.street, selectedExpert.address?.city, selectedExpert.address?.zipCode].filter(Boolean).join(', ') || 'N/A'}
                  </div>
                </div>
                <div className="h-px bg-gray-100 my-4" />
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Specialization</div>
                  <div className="font-medium text-gray-900">{selectedExpert.expertDetails?.specialization}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Degree</div>
                  <div className="font-medium text-gray-900">{selectedExpert.expertDetails?.degree}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Institution</div>
                  <div className="font-medium text-gray-900">{selectedExpert.expertDetails?.institution}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Experience</div>
                  <div className="font-medium text-gray-900">{selectedExpert.expertDetails?.experienceYears} years</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Bio</div>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mt-1">
                    {selectedExpert.expertDetails?.bio || 'No bio provided'}
                  </div>
                </div>
              </div>

              {selectedExpert.expertApplicationStatus === "pending" && (
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={() => handleAction(selectedExpert._id, 'reject')}
                    className="flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(selectedExpert._id, 'approve')}
                    className="flex items-center justify-center gap-2 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full min-h-[300px]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                 <UserCheck size={24} className="text-gray-400" />
              </div>
              <p>Select an application to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertView;