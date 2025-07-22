import React from 'react';
import { Download, Shuffle, HelpCircle, Heart } from 'lucide-react';

interface HeaderProps {
  onExport: () => void;
  onRandomize: () => void;
}

export function Header({ onExport, onRandomize }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Meshly</h1>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onRandomize}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          <span>Random</span>
        </button>
        
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Help & Support">
          <HelpCircle className="w-5 h-5" />
        </button>
        
        <button
          onClick={onExport}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
        
        <button className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Support Meshly">
          <Heart className="w-4 h-4" />
          <span>Support</span>
        </button>
      </div>
    </header>
  );
}