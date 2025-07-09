import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "fas fa-tachometer-alt", current: location === "/" },
    { name: "Trading", href: "/trading", icon: "fas fa-chart-candlestick", current: false },
    { name: "Portfolio", href: "/portfolio", icon: "fas fa-wallet", current: false },
    { name: "Trading Bots", href: "/bots", icon: "fas fa-robot", current: false },
    { name: "Market News", href: "/news", icon: "fas fa-newspaper", current: false },
    { name: "Analytics", href: "/analytics", icon: "fas fa-chart-bar", current: false },
  ];

  const integrations = [
    { name: "Telegram Bot", href: "/telegram", icon: "fab fa-telegram" },
    { name: "Discord", href: "/discord", icon: "fab fa-discord" },
    { name: "API Settings", href: "/settings", icon: "fas fa-cog" },
  ];

  return (
    <div className="w-64 bg-surface border-r border-gray-700 flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-chart-line text-white text-sm"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg">TradingBot Pro</h1>
            <p className="text-textSecondary text-xs">Multi-Platform Trading</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                item.current
                  ? "bg-primary bg-opacity-20 text-primary"
                  : "hover:bg-gray-700 text-textPrimary"
              }`}
            >
              <i className={`${item.icon} w-4`}></i>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-700">
          <p className="text-textSecondary text-xs font-medium mb-3 px-3">INTEGRATIONS</p>
          {integrations.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-textPrimary"
            >
              <i className={`${item.icon} w-4`}></i>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Account Info */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <i className="fas fa-user text-white"></i>
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">John Trader</p>
            <p className="text-textSecondary text-xs">Pro Plan</p>
          </div>
          <button className="p-1 hover:bg-gray-700 rounded">
            <i className="fas fa-ellipsis-v text-textSecondary"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
