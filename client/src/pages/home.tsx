import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import TicketCard from "@/components/tickets/ticket-card";
import ShoppingCart from "@/components/tickets/shopping-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Ticket, Users } from "lucide-react";

interface TicketCategory {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface TicketData {
  categories: TicketCategory[];
  remaining: number;
}

export default function Home() {
  const [location] = useLocation();

  // Check for artist referral
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const artistRef = urlParams.get('ref');
    if (artistRef) {
      // Store artist ref in session storage for checkout
      sessionStorage.setItem('artistRef', artistRef);
    }
  }, []);

  const { data: ticketData, isLoading, error } = useQuery<TicketData>({
    queryKey: ['/api/tickets/categories'],
  });

  const scrollToTickets = () => {
    const ticketsSection = document.getElementById('tickets');
    if (ticketsSection) {
      ticketsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAwards = () => {
    window.location.href = '/vote';
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to load ticket information</h2>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12 relative">
            <img 
              src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800" 
              alt="Elegant banquet hall with ambient lighting" 
              className="w-full h-96 object-cover rounded-2xl luxury-shadow opacity-80" 
            />
            <div className="absolute inset-0 bg-navy-900 bg-opacity-60 rounded-2xl flex items-center justify-center">
              <div className="text-center animate-fadeInUp">
                <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-4" data-testid="hero-title">
                  NAPS Dinner Night
                </h1>
                <p className="text-xl md:text-2xl text-gold-300 mb-2">Courtesy of Luminous Executives</p>
                <div className="text-gold-400 text-lg">
                  <p className="bg-gold-500 bg-opacity-20 px-4 py-2 rounded-full inline-block mb-2">
                    Departmental Dinner Night
                  </p>
                  <p className="text-sm">From the office of the D.O.S and Welfare Director</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xl mb-8 max-w-3xl mx-auto animate-fadeInUp">
            Join us for an unforgettable evening of celebration, recognition, and fellowship with fellow physics students and distinguished guests.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 animate-fadeInUp">
            <Button 
              onClick={scrollToTickets}
              className="gold-gradient text-navy-900 px-8 py-4 rounded-full font-semibold text-lg hover-lift"
              data-testid="button-get-tickets"
            >
              <Ticket className="mr-2" />
              Get Tickets
            </Button>
            <Button 
              onClick={scrollToAwards}
              variant="outline"
              className="border-2 border-gold-400 text-gold-300 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gold-400 hover:text-navy-900 transition-all"
              data-testid="button-vote-awards"
            >
              <Trophy className="mr-2" />
              Vote for Awards
            </Button>
          </div>
        </div>
      </section>

      {/* Tickets Section */}
      <section id="tickets" className="py-20 bg-white" data-testid="tickets-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair font-bold text-navy-900 mb-4">Event Tickets</h2>
            <p className="text-xl text-gray-600">Choose your perfect dining experience</p>
            {!isLoading && ticketData && (
              <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg inline-block">
                <span className="flex items-center">
                  <span className="mr-2">🎟️</span>
                  <span data-testid="remaining-tickets">{ticketData.remaining}</span> tickets remaining
                </span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-96"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <TicketCard
                  category="regular"
                  name="Regular"
                  price={5000}
                  description="Standard dining experience with full course meal and entertainment"
                />
                <TicketCard
                  category="couples"
                  name="Couples Table"
                  price={8000}
                  description="Romantic table for two with premium seating and special couple amenities"
                  popular={true}
                />
                <TicketCard
                  category="vip"
                  name="VIP Table"
                  price={50000}
                  description="Premium table with priority seating, exclusive menu, and VIP service"
                  vip={true}
                />
                <TicketCard
                  category="sponsors"
                  name="Sponsors"
                  price={100000}
                  description="Exclusive sponsorship package with premium branding and recognition"
                  sponsor={true}
                />
              </div>

              <div className="mt-12">
                <ShoppingCart />
              </div>
            </>
          )}
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gold-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-playfair font-bold text-navy-900 mb-4">Get Involved</h2>
            <p className="text-xl text-gray-600">Multiple ways to be part of this amazing evening</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link href="/vote">
              <div className="bg-white rounded-2xl luxury-shadow p-6 hover-lift transition-all cursor-pointer" data-testid="card-awards">
                <div className="text-center">
                  <Trophy className="text-purple-600 text-4xl mb-4 mx-auto" />
                  <h3 className="text-xl font-bold text-navy-900 mb-2">Awards Voting</h3>
                  <p className="text-gray-600">Vote for outstanding members of our community</p>
                </div>
              </div>
            </Link>

            <Link href="/artists">
              <div className="bg-white rounded-2xl luxury-shadow p-6 hover-lift transition-all cursor-pointer" data-testid="card-artists">
                <div className="text-center">
                  <Star className="text-blue-600 text-4xl mb-4 mx-auto" />
                  <h3 className="text-xl font-bold text-navy-900 mb-2">Artist Registration</h3>
                  <p className="text-gray-600">Showcase your talent at the dinner night</p>
                </div>
              </div>
            </Link>

            <Link href="/mr-mrs">
              <div className="bg-white rounded-2xl luxury-shadow p-6 hover-lift transition-all cursor-pointer" data-testid="card-contest">
                <div className="text-center">
                  <Users className="text-pink-600 text-4xl mb-4 mx-auto" />
                  <h3 className="text-xl font-bold text-navy-900 mb-2">MR & MRS Contest</h3>
                  <p className="text-gray-600">Compete to represent our physics community</p>
                </div>
              </div>
            </Link>

            <Link href="/verify">
              <div className="bg-white rounded-2xl luxury-shadow p-6 hover-lift transition-all cursor-pointer" data-testid="card-verify">
                <div className="text-center">
                  <Ticket className="text-green-600 text-4xl mb-4 mx-auto" />
                  <h3 className="text-xl font-bold text-navy-900 mb-2">Verify Ticket</h3>
                  <p className="text-gray-600">Check the authenticity of your tickets</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
