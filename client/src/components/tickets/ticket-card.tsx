import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { Utensils, Heart, Crown, Handshake, Plus, Minus } from "lucide-react";

interface TicketCardProps {
  category: string;
  name: string;
  price: number;
  description: string;
  popular?: boolean;
  vip?: boolean;
  sponsor?: boolean;
}

const iconMap = {
  regular: Utensils,
  couples: Heart,
  vip: Crown,
  sponsors: Handshake,
};

const colorMap = {
  regular: "bg-white border-gray-200 hover:border-gold-400",
  couples: "bg-white border-pink-200 hover:border-gold-400",
  vip: "bg-gradient-to-br from-gold-200 to-gold-300 border-gold-400",
  sponsors: "bg-gradient-to-br from-navy-900 to-navy-800 text-white border-gold-400",
};

export default function TicketCard({
  category,
  name,
  price,
  description,
  popular = false,
  vip = false,
  sponsor = false,
}: TicketCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  
  const Icon = iconMap[category as keyof typeof iconMap] || Utensils;
  const cardClass = colorMap[category as keyof typeof colorMap] || colorMap.regular;

  const handleAddToCart = () => {
    addItem(
      {
        category,
        name,
        price,
      },
      quantity
    );
    setQuantity(1);
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <div 
      className={`${cardClass} rounded-2xl p-6 hover-lift transition-all relative`}
      data-testid={`ticket-card-${category}`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-pink-500 text-white" data-testid="badge-popular">
            Popular
          </Badge>
        </div>
      )}
      
      {vip && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gold-500 text-navy-900 font-bold" data-testid="badge-vip">
            VIP
          </Badge>
        </div>
      )}
      
      {sponsor && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gold-500 text-navy-900 font-bold" data-testid="badge-sponsor">
            SPONSOR
          </Badge>
        </div>
      )}

      <div className="text-center">
        <Icon 
          className={`${
            sponsor ? "text-gold-400" : 
            vip ? "text-navy-900" : 
            category === "couples" ? "text-pink-500" : "text-navy-700"
          } text-3xl mb-4 mx-auto`} 
        />
        
        <h3 className={`text-2xl font-bold mb-2 ${sponsor ? "text-white" : "text-navy-900"}`}>
          {name}
        </h3>
        
        <div className={`text-3xl font-bold mb-4 ${
          sponsor ? "text-gold-400" : vip ? "text-navy-900" : "text-gold-500"
        }`}>
          ₦{price.toLocaleString()}
        </div>
        
        {category === "vip" && (
          <div className="text-sm text-navy-700 mb-4">(Six Seats)</div>
        )}
        
        <p className={`${
          sponsor ? "text-gray-300" : vip ? "text-navy-800" : "text-gray-600"
        } mb-6`}>
          {description}
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={`text-sm ${
              sponsor ? "text-gray-300" : vip ? "text-navy-700" : "text-gray-600"
            }`}>
              Quantity:
            </label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={decreaseQuantity}
                className="w-8 h-8 rounded-full p-0"
                data-testid={`button-decrease-${category}`}
              >
                <Minus size={14} />
              </Button>
              <span 
                className={`w-8 text-center ${sponsor ? "text-white" : "text-gray-900"}`}
                data-testid={`quantity-${category}`}
              >
                {quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={increaseQuantity}
                className="w-8 h-8 rounded-full p-0"
                data-testid={`button-increase-${category}`}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={handleAddToCart}
            className={
              sponsor
                ? "w-full gold-gradient text-navy-900 py-3 rounded-lg font-semibold hover-lift"
                : vip
                ? "w-full bg-navy-900 text-gold-300 py-3 rounded-lg font-semibold hover:bg-navy-800 transition-colors"
                : "w-full gold-gradient text-navy-900 py-3 rounded-lg font-semibold hover-lift"
            }
            data-testid={`button-add-to-cart-${category}`}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
