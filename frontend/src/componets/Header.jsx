import { Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="relative overflow-hidden mb-12">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur-3xl opacity-30" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-400 text-sm mt-1">Soft delete with 30-day recovery window</p>
          </div>
        </div>
      </div>
    </header>
  );
}
