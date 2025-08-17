import { Link, useLocation } from "wouter";
import { Star, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

export default function Navbar() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalQuantity } = useCart();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/#tickets", label: "Tickets" },
    { href: "/vote", label: "Awards" },
    { href: "/artists", label: "Artists" },
    { href: "/mr-mrs", label: "MR & MRS" },
    { href: "/verify", label: "Verify" },
  ];

  const totalItems = getTotalQuantity();

  return (
    <nav className="gradient-bg text-white shadow-lg sticky top-0 z-40" data-testid="navbar-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center" data-testid="link-home">
            <Star className="text-gold-400 text-2xl mr-3" />
            <h1 className="text-xl font-bold font-playfair">NAPS Dinner Night</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-gold-300 transition-colors"
                data-testid={`link-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart indicator */}
            {totalItems > 0 && (
              <Link href="/checkout" data-testid="link-cart">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gold-400 text-gold-300 hover:bg-gold-400 hover:text-navy-900"
                >
                  Cart ({totalItems})
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? (
                <X className="text-xl" />
              ) : (
                <Menu className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-navy-700">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-gold-300 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                  data-testid={`mobile-link-${item.label.toLowerCase().replace(" ", "-")}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
