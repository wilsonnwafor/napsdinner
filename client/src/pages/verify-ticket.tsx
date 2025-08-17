import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { QrCode, Keyboard, CheckCircle, AlertCircle, Camera } from "lucide-react";

const verifySchema = z.object({
  ticketCode: z.string().min(1, "Ticket code is required"),
  orderId: z.string().min(1, "Order ID is required"),
});

type VerifyForm = z.infer<typeof verifySchema>;

interface VerificationResult {
  valid: boolean;
  ticket?: {
    code: number;
    category: string;
    holder: string;
    orderId: string;
    status: string;
  };
  message?: string;
}

export default function VerifyTicket() {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const form = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      ticketCode: "",
      orderId: "",
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyForm) => {
      const response = await apiRequest('POST', '/api/tickets/verify', data);
      return response.json();
    },
    onSuccess: (data: VerificationResult) => {
      setVerificationResult(data);
      if (data.valid) {
        toast({
          title: "Valid Ticket",
          description: "This ticket is authentic and active.",
        });
      } else {
        toast({
          title: "Invalid Ticket",
          description: data.message || "This ticket could not be verified.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const startScanner = () => {
    setIsScanning(true);
    // In a real implementation, you would integrate with a QR scanner library
    // For now, we'll show a placeholder
    toast({
      title: "QR Scanner",
      description: "QR scanner would be activated here in the real app.",
    });
    setTimeout(() => setIsScanning(false), 3000);
  };

  const onSubmit = (data: VerifyForm) => {
    verifyMutation.mutate(data);
  };

  const reset = () => {
    setVerificationResult(null);
    form.reset();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <section className="py-20 bg-gray-100" data-testid="verify-header">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-playfair font-bold text-navy-900 mb-4">Verify Your Ticket</h1>
          <p className="text-xl text-gray-600 mb-12">Scan QR code or enter ticket details to verify authenticity</p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!verificationResult ? (
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* QR Scanner */}
              <Card className="luxury-shadow" data-testid="qr-scanner-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-navy-900">
                    <QrCode className="text-gold-500 mr-2" />
                    QR Code Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    {isScanning ? (
                      <div className="space-y-4">
                        <div className="animate-spin w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-gray-600">Scanning...</p>
                      </div>
                    ) : (
                      <>
                        <Camera className="text-gray-400 text-4xl mb-4 mx-auto" />
                        <p className="text-gray-600 mb-4">Click to activate camera and scan QR code</p>
                        <Button 
                          onClick={startScanner}
                          className="bg-navy-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-800 transition-colors"
                          data-testid="button-start-scanner"
                        >
                          <Camera className="mr-2" />
                          Start Scanner
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Manual Verification */}
              <Card className="luxury-shadow" data-testid="manual-verify-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-navy-900">
                    <Keyboard className="text-gold-500 mr-2" />
                    Manual Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="ticketCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ticket Code</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter ticket code (e.g., 501)" 
                                {...field} 
                                data-testid="input-ticket-code"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="orderId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order ID</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter order ID" 
                                {...field} 
                                data-testid="input-order-id"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full gold-gradient text-navy-900 py-3 rounded-lg font-semibold hover-lift"
                        disabled={verifyMutation.isPending}
                        data-testid="button-verify-ticket"
                      >
                        {verifyMutation.isPending ? (
                          "Verifying..."
                        ) : (
                          <>
                            <CheckCircle className="mr-2" />
                            Verify Ticket
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Verification Result */
            <div className="max-w-2xl mx-auto">
              <Card className={`luxury-shadow ${verificationResult.valid ? 'border-green-200' : 'border-red-200'}`} data-testid="verification-result">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    {verificationResult.valid ? (
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-white text-2xl" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-white text-2xl" />
                      </div>
                    )}
                    
                    <h3 className={`text-2xl font-bold mb-4 ${verificationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                      {verificationResult.valid ? 'Valid Ticket' : 'Invalid Ticket'}
                    </h3>
                  </div>

                  {verificationResult.valid && verificationResult.ticket && (
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Ticket Code:</span>
                        <span className="font-mono text-lg" data-testid="result-ticket-code">
                          #{verificationResult.ticket.code}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Category:</span>
                        <Badge variant="secondary" data-testid="result-category">
                          {verificationResult.ticket.category}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Ticket Holder:</span>
                        <span data-testid="result-holder">{verificationResult.ticket.holder}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Order ID:</span>
                        <span className="font-mono text-sm" data-testid="result-order-id">
                          {verificationResult.ticket.orderId}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Status:</span>
                        <Badge 
                          className={verificationResult.ticket.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          data-testid="result-status"
                        >
                          {verificationResult.ticket.status}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {!verificationResult.valid && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-700 text-center">
                        {verificationResult.message || "This ticket could not be verified. Please check the details and try again."}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button 
                      onClick={reset}
                      variant="outline"
                      className="px-8"
                      data-testid="button-verify-another"
                    >
                      Verify Another Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
