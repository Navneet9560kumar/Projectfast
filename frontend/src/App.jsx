import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import apiClient from "./config/api";
import { Header } from "./componets/Header";
import { UserForm } from "./componets/UserForm";
import { ActiveUsers } from "./componets/ActiveUsers";
import { DeletedUsers } from "./componets/DeletedUsers";

export default function App() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingActive, setIsLoadingActive] = useState(false);
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch active users
  const fetchActiveUsers = async () => {
    setIsLoadingActive(true);
    try {
      const response = await apiClient.get("/users/");
      setActiveUsers(response.data);
      setError(null);
    } catch (err) {
      console.error("[API Error] Failed to fetch active users:", err);
      setError(
        "Failed to load active users. Please check your API connection.",
      );
    } finally {
      setIsLoadingActive(false);
    }
  };

  // Fetch deleted users
  const fetchDeletedUsers = async () => {
    setIsLoadingDeleted(true);
    try {
      const response = await apiClient.get("/users/deleted/");
      setDeletedUsers(response.data.users || response.data);
      setError(null);
    } catch (err) {
      console.error("[API Error] Failed to fetch deleted users:", err);
      setError("Failed to load deleted users. Make sure your API is running.");
    } finally {
      setIsLoadingDeleted(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchActiveUsers();
    fetchDeletedUsers();
  }, []);

  // Add or update user
  const handleAddUser = async (userData) => {
    setIsLoading(true);
    try {
      if (editingUser) {
        await apiClient.put(`/users/${editingUser.id}/`, userData);
        setSuccess("User updated successfully!");
      } else {
        await apiClient.post("/users/", userData);
        setSuccess("User created successfully!");
      }
      await fetchActiveUsers();
      setEditingUser(null);
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("[API Error] Failed to save user:", err);
      setError("Failed to save user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  // Soft delete user
  const handleDeleteUser = async (userId, isHardDelete = false) => {
    setIsLoadingDelete(userId);
    try {
      if (isHardDelete) {
        await apiClient.delete(`/users/${userId}/`);
        setSuccess("User permanently deleted!");
      } else {
        await apiClient.delete(`/users/${userId}/`);
        setSuccess("User moved to recycle bin!");
      }
      await fetchActiveUsers();
      await fetchDeletedUsers();
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("[API Error] Failed to delete user:", err);
      setError("Failed to delete user. Please try again.");
    } finally {
      setIsLoadingDelete(null);
    }
  };

  // Restore user
  const handleRestoreUser = async (userId) => {
    setIsLoadingDelete(userId);
    try {
      await apiClient.post(`/users/${userId}/restore/`);
      await fetchActiveUsers();
      await fetchDeletedUsers();
      setSuccess("User restored successfully!");
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("[API Error] Failed to restore user:", err);
      setError(
        "Failed to restore user. They may have been permanently deleted.",
      );
    } finally {
      setIsLoadingDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Grid background effect */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Header />

          {/* Error Alert */}
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium">Error</p>
                <p className="text-red-200/80 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <div className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <p className="text-emerald-300 font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <UserForm
            onSubmit={handleAddUser}
            isLoading={isLoading}
            editingUser={editingUser}
            onCancel={handleCancelEdit}
          />

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-700/30">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === "active"
                  ? "text-indigo-400 border-indigo-400"
                  : "text-gray-400 border-transparent hover:text-gray-300"
              }`}
            >
              Active Users
            </button>
            <button
              onClick={() => setActiveTab("deleted")}
              className={`px-4 py-3 font-medium transition-all duration-200 border-b-2 ${
                activeTab === "deleted"
                  ? "text-red-400 border-red-400"
                  : "text-gray-400 border-transparent hover:text-gray-300"
              }`}
            >
              Recycle Bin
            </button>
          </div>

          {/* Content */}
          {activeTab === "active" && (
            <ActiveUsers
              users={activeUsers}
              onDelete={handleDeleteUser}
              onEdit={handleEditUser}
              isLoading={isLoadingActive}
              isLoadingDelete={isLoadingDelete}
            />
          )}

          {activeTab === "deleted" && (
            <DeletedUsers
              users={deletedUsers}
              onRestore={handleRestoreUser}
              onDelete={handleDeleteUser}
              isLoading={isLoadingDeleted}
              isLoadingDelete={isLoadingDelete}
            />
          )}
        </div>
      </div>
    </div>
  );
}
