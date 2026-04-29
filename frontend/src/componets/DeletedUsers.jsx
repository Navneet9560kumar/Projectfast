import { Trash2, Loader } from "lucide-react";
import { UserCard } from "./UserCard";
import { useState, useMemo } from "react";

export function DeletedUsers({
  users,
  onRestore,
  onDelete,
  isLoading,
  isLoadingDelete,
}) {
  const filteredUsers = useMemo(() => {
    return users;
  }, [users]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader className="w-8 h-8 text-red-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading deleted users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16 backdrop-blur-md bg-gradient-to-br from-gray-500/5 to-transparent border border-gray-700/30 rounded-xl">
        <Trash2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No deleted users. Everything is clean!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full" />
          Recycle Bin
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {filteredUsers.length} of {users.length} user
          {users.length !== 1 ? "s" : ""} in trash
        </p>
      </div>

      {users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onRestore={onRestore}
              onDelete={onDelete}
              isLoading={isLoadingDelete === user.id}
              isDeleted
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trash2 className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <p className="text-white/70">No deleted users</p>
        </div>
      )}
    </div>
  );
}
