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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserCheck, Crown, Trophy, Camera, Calendar, Clock, Users } from "lucide-react";

const contestSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  department: z.string().min(1, "Please select a department"),
  level: z.string().min(1, "Please select your level"),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(500, "Bio must not exceed 500 characters"),
  consent: z.boolean().refine(val => val === true, "You must agree to the terms"),
});

type ContestForm = z.infer<typeof contestSchema>;

export default function MrMrsRegister() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContestForm>({
    resolver: zodResolver(contestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      level: "",
      bio: "",
      consent: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: ContestForm) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      const response = await fetch('/api/contest', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Registration Successful!",
        description: "Your application has been submitted for review.",
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const onSubmit = (data: ContestForm) => {
    if (!selectedFile) {
      toast({
        title: "Photo Required",
        description: "Please upload a profile photo.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50" data-testid="contest-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-playfair font-bold text-navy-900 mb-4">MR & MRS NAPS Contest</h1>
          <p className="text-xl text-gray-600">Compete to represent our amazing physics community</p>
          <div className="mt-4 bg-pink-100 border border-pink-400 text-pink-700 px-4 py-3 rounded-lg inline-block">
            <Crown className="inline mr-2" size={16} />
            Registration closes soon - Apply now!
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Registration Form */}
            <Card className="luxury-shadow" data-testid="contest-form">
              <CardHeader>
                <CardTitle className="flex items-center text-navy-900">
                  <Users className="text-pink-500 mr-2" />
                  Contest Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isSubmitted ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="John" 
                                  {...field} 
                                  data-testid="input-first-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Doe" 
                                  {...field} 
                                  data-testid="input-last-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

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
                                data-testid="input-contest-email"
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
                                data-testid="input-contest-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-department">
                                    <SelectValue placeholder="Select Department" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="physics">Physics</SelectItem>
                                  <SelectItem value="applied-physics">Applied Physics</SelectItem>
                                  <SelectItem value="theoretical-physics">Theoretical Physics</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Level *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-level">
                                    <SelectValue placeholder="Select Level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="100">100 Level</SelectItem>
                                  <SelectItem value="200">200 Level</SelectItem>
                                  <SelectItem value="300">300 Level</SelectItem>
                                  <SelectItem value="400">400 Level</SelectItem>
                                  <SelectItem value="500">500 Level</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Bio *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about yourself, your achievements, and why you'd make a great MR/MRS NAPS..." 
                                rows={4}
                                {...field} 
                                data-testid="textarea-bio"
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-sm text-gray-500">
                              {field.value.length}/500 characters
                            </p>
                          </FormItem>
                        )}
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo *</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
                          <Camera className="text-gray-400 text-3xl mb-2 mx-auto" />
                          <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500 mb-3">PNG, JPG up to 5MB</p>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                            className="hidden" 
                            id="photo-upload"
                            data-testid="input-photo"
                          />
                          <label 
                            htmlFor="photo-upload" 
                            className="cursor-pointer inline-block bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors"
                          >
                            Choose File
                          </label>
                          {selectedFile && (
                            <p className="mt-2 text-sm text-green-600">
                              Selected: {selectedFile.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="consent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="checkbox-consent"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm">
                                I consent to my photo and information being used for contest promotion and agree to the terms and conditions of the MR & MRS NAPS contest. *
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover-lift"
                        disabled={registerMutation.isPending}
                        data-testid="button-submit-contest"
                      >
                        {registerMutation.isPending ? "Submitting..." : "Submit Registration"}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center" data-testid="contest-success">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="text-white text-2xl" />
                    </div>
                    <h4 className="font-bold text-green-800 text-xl mb-2">Registration Submitted!</h4>
                    <p className="text-green-700">
                      Thank you for registering for the MR & MRS NAPS contest. Your application is under review and you'll be notified about the shortlisting process.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contest Information */}
            <div className="space-y-6">
              <img 
                src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                alt="Elegant portrait of contest participants" 
                className="w-full h-64 object-cover rounded-2xl luxury-shadow" 
              />

              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold text-navy-900 mb-4">Contest Timeline</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div>
                        <h5 className="font-semibold text-navy-800">Registration Open</h5>
                        <p className="text-gray-600 text-sm">Now - December 15th</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div>
                        <h5 className="font-semibold text-navy-800">Shortlisting</h5>
                        <p className="text-gray-600 text-sm">December 16th - 20th</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <div>
                        <h5 className="font-semibold text-navy-800">Final Contest</h5>
                        <p className="text-gray-600 text-sm">At the Dinner Night Event</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-gold-900 to-navy-900 text-white">
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold mb-4 flex items-center">
                    <Trophy className="text-gold-400 mr-2" />
                    Prizes & Benefits
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-gold-300 mb-2">Winner</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Crown & Sash</li>
                        <li>• ₦50,000 Prize</li>
                        <li>• Photo Shoot</li>
                        <li>• 1-Year Title</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gold-300 mb-2">All Finalists</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Free Dinner Ticket</li>
                        <li>• Certificate</li>
                        <li>• Social Recognition</li>
                        <li>• Networking</li>
                      </ul>
                    </div>
                  </div>
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
