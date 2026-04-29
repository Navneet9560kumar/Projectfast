import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

const USER_TYPES = ["user"];

export function UserForm({ onSubmit, isLoading, editingUser, onCancel }) {
  const [formData, setFormData] = useState(
    editingUser || { name: "", email: "", user_type: "user" },
  );
  const [errors, setErrors] = useState({});

  // Update form when editingUser changes
  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || "",
        email: editingUser.email || "",
        user_type: editingUser.user_type || "user",
      });
    } else {
      setFormData({ name: "", email: "", user_type: "user" });
    }
    setErrors({});
  }, [editingUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.user_type) newErrors.user_type = "User type is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length === 0) {
      await onSubmit(formData);
      setFormData({ name: "", email: "", user_type: "user" });
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="backdrop-blur-md bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 rounded-xl p-6 mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">
          {editingUser ? "✏️ Update User" : "➕ Add New User"}
        </h2>
        {editingUser && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 hover:bg-white/10 rounded-lg transition"
          >
            <X size={20} className="text-white/70" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className={`w-full px-4 py-3 rounded-lg bg-black/40 border transition-all text-white placeholder-gray-500 outline-none ${
              errors.name
                ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className={`w-full px-4 py-3 rounded-lg bg-black/40 border transition-all text-white placeholder-gray-500 outline-none ${
              errors.email
                ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            User Type
          </label>
          <select
            name="user_type"
            value={formData.user_type}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg bg-black/40 border transition-all text-white outline-none ${
              errors.user_type
                ? "border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
          >
            {USER_TYPES.map((type) => (
              <option key={type} value={type} className="bg-gray-900">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          {errors.user_type && (
            <p className="text-red-400 text-sm mt-1">{errors.user_type}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            isLoading
              ? "bg-gray-600/30 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white active:scale-95"
          }`}
        >
          <Plus size={20} />
          {editingUser ? "Update User" : "Add User"}
        </button>
        {editingUser && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-lg font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
