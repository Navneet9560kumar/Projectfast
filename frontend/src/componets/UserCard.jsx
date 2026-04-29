import { Trash2, RotateCcw, AlertTriangle, Edit2 } from "lucide-react";
import {
  formatRelativeTime,
  getDaysUntilPurge,
  getPurgeDate,
  getStatusColor,
} from "../utils/formatters";
import clsx from "clsx";

export function UserCard({
  user,
  onDelete,
  onRestore,
  onEdit,
  isLoading,
  isDeleted = false,
}) {
  const daysLeft = isDeleted ? getDaysUntilPurge(user.deleted_at) : null;
  const purgeDate = isDeleted ? getPurgeDate(user.deleted_at) : null;
  const isUrgent = isDeleted && daysLeft <= 7;

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-xl backdrop-blur-md transition-all duration-300",
        isDeleted
          ? "bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/30 hover:border-red-500/50"
          : "bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 hover:border-blue-500/50",
        "hover:shadow-lg hover:shadow-blue-500/20",
      )}
    >
      {isUrgent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-500" />
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {user.name}
            </h3>
            <p className="text-sm text-gray-400 break-all">{user.email}</p>
          </div>
          {isDeleted && isUrgent && (
            <div className="ml-3 p-2 bg-orange-500/20 rounded-lg">
              <AlertTriangle size={20} className="text-orange-400" />
            </div>
          )}
        </div>

        {!isDeleted && (
          <div className="mb-4 p-3 bg-black/40 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/30 text-blue-300">
                {(user.user_type || "USER").toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {isDeleted && (
          <div className="mb-4 p-3 bg-black/40 rounded-lg border border-red-500/20">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Deleted
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  {formatRelativeTime(user.deleted_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Purge In
                </p>
                <p
                  className={clsx(
                    "text-sm font-semibold mt-1",
                    isUrgent ? "text-orange-400" : "text-emerald-400",
                  )}
                >
                  {daysLeft} days
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Final Date
                </p>
                <p className="text-sm text-gray-300 mt-1">{purgeDate}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {isDeleted ? (
            <>
              <button
                onClick={() => onRestore(user.id)}
                disabled={isLoading}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200",
                  isLoading
                    ? "bg-gray-600/30 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-500/80 hover:bg-emerald-600 text-white active:scale-95",
                )}
              >
                <RotateCcw size={16} />
                Restore
              </button>
              <button
                onClick={() => onDelete(user.id, true)}
                disabled={isLoading}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200",
                  isLoading
                    ? "bg-gray-600/30 text-gray-500 cursor-not-allowed"
                    : "bg-red-600/80 hover:bg-red-700 text-white active:scale-95",
                )}
              >
                <Trash2 size={16} />
                Purge
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEdit(user)}
                disabled={isLoading}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200",
                  isLoading
                    ? "bg-gray-600/30 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500/80 hover:bg-blue-600 text-white active:scale-95",
                )}
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => onDelete(user.id)}
                disabled={isLoading}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200",
                  isLoading
                    ? "bg-gray-600/30 text-gray-500 cursor-not-allowed"
                    : "bg-red-500/80 hover:bg-red-600 text-white active:scale-95",
                )}
              >
                <Trash2 size={16} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
