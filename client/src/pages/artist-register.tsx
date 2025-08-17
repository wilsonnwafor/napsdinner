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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mic, Star, Gift, Copy, Info } from "lucide-react";

const artistSchema = z.object({
  name: z.string().min(2, "Artist name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  actType: z.string().min(1, "Please select an act type"),
  socialLink: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type ArtistForm = z.infer<typeof artistSchema>;

interface RegistrationResponse {
  message: string;
  referralLink: string;
  referralCode: string;
}

export default function ArtistRegister() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationResponse | null>(null);
  const { toast } = useToast();

  const form = useForm<ArtistForm>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      actType: "",
      socialLink: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: ArtistForm) => {
      const response = await apiRequest('POST', '/api/artists', data);
      return response.json();
    },
    onSuccess: (data: RegistrationResponse) => {
      setRegistrationData(data);
      setIsSubmitted(true);
      toast({
        title: "Registration Successful!",
        description: "Your referral link is ready. Share it to get approved!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = () => {
    if (registrationData) {
      navigator.clipboard.writeText(registrationData.referralLink);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard.",
      });
    }
  };

  const onSubmit = (data: ArtistForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <section className="py-20 bg-white" data-testid="artist-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-playfair font-bold text-navy-900 mb-4">Artists Registration</h1>
          <p className="text-xl text-gray-600">Showcase your talent at NAPS Dinner Night</p>
          <div className="mt-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg inline-block">
            <Star className="inline mr-2" size={16} />
            Get approved by referring 5 ticket sales!
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Registration Form */}
            <Card className="luxury-shadow" data-testid="artist-form">
              <CardHeader>
                <CardTitle className="flex items-center text-navy-900">
                  <Mic className="text-gold-500 mr-2" />
                  Register as an Artist
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isSubmitted ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Artist Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your stage name" 
                                {...field} 
                                data-testid="input-artist-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="your@email.com" 
                                {...field} 
                                data-testid="input-artist-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input 
                                type="tel"
                                placeholder="+234 xxx xxx xxxx" 
                                {...field} 
                                data-testid="input-artist-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="actType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Act Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-act-type">
                                  <SelectValue placeholder="Select your act type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="music">Music Performance</SelectItem>
                                <SelectItem value="dance">Dance</SelectItem>
                                <SelectItem value="comedy">Comedy</SelectItem>
                                <SelectItem value="poetry">Poetry/Spoken Word</SelectItem>
                                <SelectItem value="magic">Magic/Illusion</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="socialLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Social Media Link</FormLabel>
                            <FormControl>
                              <Input 
                                type="url"
                                placeholder="https://instagram.com/yourusername" 
                                {...field} 
                                data-testid="input-social-link"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full gold-gradient text-navy-900 py-4 rounded-xl font-bold text-lg hover-lift"
                        disabled={registerMutation.isPending}
                        data-testid="button-submit-registration"
                      >
                        {registerMutation.isPending ? "Submitting..." : "Submit Registration"}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6" data-testid="success-state">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <h4 className="font-bold text-green-800">Registration Submitted!</h4>
                    </div>
                    <p className="text-green-700 mb-4">Your referral link is ready. Share it to get 5 ticket sales for approval:</p>
                    
                    {registrationData && (
                      <>
                        <div className="bg-white border border-green-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                          <code className="text-sm text-gray-800 flex-1 mr-2" data-testid="referral-link">
                            {registrationData.referralLink}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={copyToClipboard}
                            data-testid="button-copy-link"
                          >
                            <Copy size={16} />
                          </Button>
                        </div>
                        <div className="text-sm text-green-600">
                          <Info className="inline mr-1" size={16} />
                          Referred sales: <span data-testid="referred-sales">0</span>/5
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Information Panel */}
            <div className="space-y-6">
              <img 
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                alt="Live performance at music event" 
                className="w-full h-64 object-cover rounded-2xl luxury-shadow" 
              />
              
              <Card className="bg-gradient-to-r from-gold-50 to-gold-100">
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold text-navy-900 mb-4">How It Works</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h5 className="font-semibold text-navy-800">Register Your Act</h5>
                        <p className="text-gray-600 text-sm">Submit your information and get a unique referral link</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h5 className="font-semibold text-navy-800">Share Your Link</h5>
                        <p className="text-gray-600 text-sm">Promote ticket sales through your referral link</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h5 className="font-semibold text-navy-800">Get Approved</h5>
                        <p className="text-gray-600 text-sm">Once you reach 5 referred sales, you're automatically approved to perform!</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-navy-900 text-white">
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold mb-4 flex items-center">
                    <Gift className="text-gold-400 mr-2" />
                    Artist Benefits
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="text-gold-400 mr-2">✓</span>
                      Free dinner ticket on approval
                    </li>
                    <li className="flex items-center">
                      <span className="text-gold-400 mr-2">✓</span>
                      Performance slot at the event
                    </li>
                    <li className="flex items-center">
                      <span className="text-gold-400 mr-2">✓</span>
                      Social media promotion
                    </li>
                    <li className="flex items-center">
                      <span className="text-gold-400 mr-2">✓</span>
                      Networking opportunities
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
