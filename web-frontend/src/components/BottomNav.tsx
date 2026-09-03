import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/',         icon: 'shield',        label: 'Dashboard' },
  { path: '/forensics',icon: 'graphic_eq',     label: 'Forensics' },
  { path: '/settings', icon: 'tune',           label: 'Settings' },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#0B0E14]/90 backdrop-blur-xl border-t border-white/[0.05]">
      <div className="h-16 px-6 max-w-lg mx-auto flex items-center justify-around">
        {navItems.map(item => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${active ? 'text-[#E5C365]' : 'text-slate-400 hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-[22px]" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {item.icon}
              </span>
              <span className={`text-[10px] tracking-wider uppercase mt-1 ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
