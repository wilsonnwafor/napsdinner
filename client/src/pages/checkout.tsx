import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { paystackService } from "@/lib/paystack";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 characters"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, getTotalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutForm & { items: any[]; artistRef?: string }) => {
      const response = await apiRequest('POST', '/api/orders', data);
      return response.json();
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (reference: string) => {
      const response = await apiRequest('POST', '/api/payments/verify', { reference });
      return response.json();
    },
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-navy-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some tickets to proceed with checkout</p>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home">
            <ArrowLeft className="mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const totalAmount = getTotalAmount();

  const onSubmit = async (data: CheckoutForm) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      // Get artist referral if exists
      const artistRef = sessionStorage.getItem('artistRef');

      // Prepare order data
      const orderData = {
        ...data,
        items: items.map(item => ({
          category: item.category,
          quantity: item.quantity,
        })),
        artistRef: artistRef || undefined,
      };

      // Create order
      const orderResponse = await createOrderMutation.mutateAsync(orderData);

      // Initialize Paystack payment
      await paystackService.initializePayment({
        key: orderResponse.publicKey,
        email: data.customerEmail,
        amount: totalAmount * 100, // Convert to kobo
        currency: 'NGN',
        reference: orderResponse.reference,
        metadata: {
          orderId: orderResponse.orderId,
          artistRef: artistRef || null,
          items: items.map(item => ({
            category: item.category,
            quantity: item.quantity,
          }))
        },
        callback: function(response: any) {
          // Use non-async callback for Paystack compatibility
          verifyPaymentMutation.mutateAsync(response.reference)
            .then(() => {
              clearCart();
              sessionStorage.removeItem('artistRef');
              
              toast({
                title: "Payment Successful!",
                description: "Your tickets have been sent to your email.",
              });
              
              setLocation("/");
            })
            .catch((error) => {
              console.error('Payment verification error:', error);
              toast({
                title: "Payment Verification Failed",
                description: "Please contact support if you were charged.",
                variant: "destructive",
              });
            })
            .finally(() => {
              setIsProcessing(false);
            });
        },
        onClose: function() {
          setIsProcessing(false);
        },
      });

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mr-4"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-navy-900">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="luxury-shadow" data-testid="order-summary">
            <CardHeader>
              <CardTitle className="text-navy-900">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.category} 
                    className="flex justify-between items-center py-3 border-b"
                    data-testid={`order-item-${item.category}`}
                  >
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-bold">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-gold-500" data-testid="total-amount">
                      ₦{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card className="luxury-shadow" data-testid="checkout-form">
            <CardHeader>
              <CardTitle className="text-navy-900">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="your@email.com" 
                            {...field} 
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="+234 xxx xxx xxxx" 
                            {...field} 
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <span className="text-yellow-500 mr-2">ℹ️</span>
                      <div className="text-sm">
                        <p className="text-yellow-800 font-medium">Important:</p>
                        <ul className="text-yellow-700 mt-1 space-y-1">
                          <li>• Your tickets will be sent to the provided email address</li>
                          <li>• Please ensure all information is correct</li>
                          <li>• Keep your tickets safe for the event</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gold-gradient text-navy-900 py-4 rounded-xl font-bold text-lg hover-lift"
                    disabled={isProcessing}
                    data-testid="button-pay"
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Lock className="mr-2" />
                        Pay Securely with Paystack
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
