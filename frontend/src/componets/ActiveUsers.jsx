import { Users, Loader, Search } from "lucide-react";
import { UserCard } from "./UserCard";
import { useState, useMemo } from "react";

export function ActiveUsers({
  users,
  onDelete,
  onEdit,
  isLoading,
  isLoadingDelete,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all");

  const filteredUsers = useMemo(() => {
    if (viewMode === "all") {
      return users;
    } else {
      return users.filter((user) => {
        return (
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
  }, [users, searchTerm, viewMode]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader className="w-8 h-8 text-blue-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16 backdrop-blur-md bg-gradient-to-br from-gray-500/5 to-transparent border border-gray-700/30 rounded-xl">
        <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">
          No active users found. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-full" />
          Active Users
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {filteredUsers.length} of {users.length} user
          {users.length !== 1 ? "s" : ""} active
        </p>
      </div>

      <div className="mb-6">
        {/* View Mode Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => {
              setViewMode("all");
              setSearchTerm("");
            }}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              viewMode === "all"
                ? "bg-blue-500 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setViewMode("specific")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              viewMode === "specific"
                ? "bg-blue-500 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            Specific User
          </button>
        </div>

        {/* Search Bar - Only show for Specific User mode */}
        {viewMode === "specific" && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>
        )}
      </div>

      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onDelete={onDelete}
              onEdit={onEdit}
              isLoading={isLoadingDelete === user.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No users match your search</p>
        </div>
      )}
    </div>
  );
}
