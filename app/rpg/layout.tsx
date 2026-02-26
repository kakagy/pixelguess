import type { ReactNode } from "react";

export default function RPGLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white pb-16">
      {children}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around py-2 px-4 z-50">
        <NavItem href="/rpg" icon="🏠" label="Home" />
        <NavItem href="/rpg/leaderboard" icon="🏆" label="Ranking" />
        <NavItem href="/rpg/gacha" icon="🎰" label="Gacha" />
        <NavItem href="/rpg/shop" icon="💎" label="Shop" />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a href={href} className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors">
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-mono">{label}</span>
    </a>
  );
}
