import { Link } from "wouter";
import { Star, Facebook, Instagram, Twitter, Calendar, Clock, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="gradient-bg text-white py-16" data-testid="footer-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Star className="text-gold-400 text-2xl mr-2" />
              <h3 className="text-xl font-bold font-playfair">NAPS Dinner Night</h3>
            </div>
            <p className="text-gray-300 mb-4">
              An exclusive evening celebrating excellence in physics education and community.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gold-400 hover:text-gold-300 transition-colors"
                data-testid="social-facebook"
              >
                <Facebook className="text-xl" />
              </a>
              <a 
                href="#" 
                className="text-gold-400 hover:text-gold-300 transition-colors"
                data-testid="social-instagram"
              >
                <Instagram className="text-xl" />
              </a>
              <a 
                href="#" 
                className="text-gold-400 hover:text-gold-300 transition-colors"
                data-testid="social-twitter"
              >
                <Twitter className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/#tickets" 
                  className="text-gray-300 hover:text-gold-300 transition-colors"
                  data-testid="footer-link-tickets"
                >
                  Buy Tickets
                </Link>
              </li>
              <li>
                <Link 
                  href="/vote" 
                  className="text-gray-300 hover:text-gold-300 transition-colors"
                  data-testid="footer-link-awards"
                >
                  Vote Awards
                </Link>
              </li>
              <li>
                <Link 
                  href="/artists" 
                  className="text-gray-300 hover:text-gold-300 transition-colors"
                  data-testid="footer-link-artists"
                >
                  Artist Registration
                </Link>
              </li>
              <li>
                <Link 
                  href="/mr-mrs" 
                  className="text-gray-300 hover:text-gold-300 transition-colors"
                  data-testid="footer-link-contest"
                >
                  MR & MRS Contest
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/verify" 
                  className="text-gray-300 hover:text-gold-300 transition-colors"
                  data-testid="footer-link-verify"
                >
                  Verify Ticket
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@naps-dinner.com" 
                  className="text-gray-300 hover:text-gold-300 transition-colors"
                  data-testid="footer-link-support"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-gold-300 transition-colors"
                  data-testid="footer-link-faq"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-gold-300 transition-colors"
                  data-testid="footer-link-terms"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Event Details</h4>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center" data-testid="event-date">
                <Calendar className="mr-2 text-gold-400" size={16} />
                December 22, 2024
              </p>
              <p className="flex items-center" data-testid="event-time">
                <Clock className="mr-2 text-gold-400" size={16} />
                6:00 PM - 11:00 PM
              </p>
              <p className="flex items-center" data-testid="event-location">
                <MapPin className="mr-2 text-gold-400" size={16} />
                Grand Ballroom, Lagos
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-navy-700 mt-12 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 NAPS Dinner Night. All rights reserved. | Powered by Luminous Executives
          </p>
        </div>
      </div>
    </footer>
  );
}
