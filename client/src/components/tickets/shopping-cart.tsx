import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart as ShoppingCartIcon, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function ShoppingCart() {
  const { items, getTotalAmount, getTotalQuantity } = useCart();

  if (items.length === 0) {
    return null;
  }

  const totalQuantity = getTotalQuantity();
  const totalAmount = getTotalAmount();

  return (
    <Card className="max-w-md mx-auto luxury-shadow" data-testid="shopping-cart">
      <CardHeader>
        <CardTitle className="flex items-center text-navy-900">
          <ShoppingCartIcon className="mr-2" />
          Your Cart
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <div 
              key={item.category} 
              className="flex justify-between items-center py-2 border-b"
              data-testid={`cart-item-${item.category}`}
            >
              <span>{item.name} × {item.quantity}</span>
              <span className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-xl font-bold mb-6">
            <span>Total:</span>
            <span className="text-gold-500" data-testid="cart-total">
              ₦{totalAmount.toLocaleString()}
            </span>
          </div>

          <Link href="/checkout">
            <Button 
              className="w-full gold-gradient text-navy-900 py-4 rounded-xl font-bold text-lg hover-lift"
              data-testid="button-proceed-checkout"
            >
              <CreditCard className="mr-2" />
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
