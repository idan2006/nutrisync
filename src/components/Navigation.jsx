import React from 'react';
import { Home, UtensilsCrossed, User } from 'lucide-react';

const tabs = [
  { id: 'home',    label: 'Home',    Icon: Home },
  { id: 'meals',   label: 'Meals',   Icon: UtensilsCrossed },
  { id: 'profile', label: 'Profile', Icon: User },
];

export default function Navigation({ currentPage, setCurrentPage }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-100 z-50 safe-area-pb">
      <div className="flex justify-around max-w-lg mx-auto px-2">
        {tabs.map(({ id, label, Icon }) => {
          const active = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`flex flex-col items-center gap-1 py-3 px-8 transition-all ${
                active ? 'text-brand-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
