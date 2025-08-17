import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  BarChart3, 
  Ticket, 
  Package, 
  Trophy, 
  Mic, 
  Users, 
  Settings, 
  FileText, 
  LogOut,
  Menu,
  X
} from "lucide-react";

interface AdminSidebarProps {
  onLogout: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/admin", icon: BarChart3, label: "Overview", exact: true },
    { href: "/admin/orders", icon: Ticket, label: "Tickets & Orders" },
    { href: "/admin/inventory", icon: Package, label: "Inventory" },
    { href: "/admin/awards", icon: Trophy, label: "Awards & Voting" },
    { href: "/admin/artists", icon: Mic, label: "Artists" },
    { href: "/admin/contest", icon: Users, label: "MR & MRS Contest" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
    { href: "/admin/logs", icon: FileText, label: "Logs" },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return location === href;
    }
    return location.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <div className="flex items-center mb-8">
          <Shield className="text-gold-400 text-2xl mr-2" />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive(item.href, item.exact)
                      ? "bg-navy-800 bg-opacity-50"
                      : "hover:bg-navy-800 hover:bg-opacity-50"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-navy-800 bg-opacity-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center mr-2">
              <span className="text-navy-900 font-bold text-sm">A</span>
            </div>
            <span className="font-medium">Admin User</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-sm text-gray-300 hover:text-white transition-colors p-0 h-auto"
            data-testid="button-logout"
          >
            <LogOut className="mr-1" size={14} />
            Logout
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-lg"
          data-testid="button-mobile-menu"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 gradient-bg text-white flex-shrink-0 relative" data-testid="desktop-sidebar">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-64 gradient-bg text-white" data-testid="mobile-sidebar">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
