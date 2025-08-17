import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Vote, Share, TrendingUp, Flame, Heart, Info } from "lucide-react";

const voteSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type VoteForm = z.infer<typeof voteSchema>;

interface Awardee {
  id: string;
  name: string;
  bio: string;
  photoUrl: string;
  slug: string;
}

interface Award {
  id: string;
  title: string;
  showPublicCounts: boolean;
}

interface VotingCardProps {
  awardee: Awardee;
  award: Award;
  showTitle?: boolean;
  voteCount?: number;
}

export default function VotingCard({ awardee, award, showTitle = false, voteCount = 0 }: VotingCardProps) {
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const { toast } = useToast();

  const form = useForm<VoteForm>({
    resolver: zodResolver(voteSchema),
    defaultValues: {
      email: "",
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (data: VoteForm) => {
      const response = await apiRequest('POST', '/api/votes', {
        awardId: award.id,
        awardeeId: awardee.id,
        email: data.email,
      });
      return response.json();
    },
    onSuccess: () => {
      setHasVoted(true);
      setIsVoteDialogOpen(false);
      form.reset();
      toast({
        title: "Vote Submitted!",
        description: "Thank you for voting. Your vote has been recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Vote Failed",
        description: error.message || "You may have already voted for this category.",
        variant: "destructive",
      });
    },
  });

  const shareAwardee = async () => {
    const shareUrl = `${window.location.origin}/vote/${awardee.slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vote for ${awardee.name}`,
          text: `Vote for ${awardee.name} in the ${award.title} category!`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard.",
      });
    }
  };

  const onSubmit = (data: VoteForm) => {
    voteMutation.mutate(data);
  };

  const getStatusBadge = () => {
    if (voteCount > 150) {
      return (
        <Badge className="bg-green-100 text-green-600">
          <TrendingUp className="mr-1" size={12} />
          Leading
        </Badge>
      );
    } else if (voteCount > 100) {
      return (
        <Badge className="bg-blue-100 text-blue-600">
          <Flame className="mr-1" size={12} />
          Rising
        </Badge>
      );
    } else if (voteCount > 50) {
      return (
        <Badge className="bg-purple-100 text-purple-600">
          <Heart className="mr-1" size={12} />
          Popular
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white rounded-2xl luxury-shadow overflow-hidden hover-lift" data-testid={`voting-card-${awardee.slug}`}>
      {/* Awardee Photo */}
      <div className="relative">
        <img 
          src={awardee.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
          alt={`${awardee.name}`} 
          className="w-full h-48 object-cover" 
        />
        {showTitle && (
          <div className="absolute top-4 left-4 right-4">
            <Badge className="bg-navy-900 text-gold-300">
              {award.title}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {!showTitle && (
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 bg-gold-500 rounded-full mr-2"></div>
            <h3 className="font-bold text-lg text-navy-900">{award.title}</h3>
          </div>
        )}
        
        <h4 className="text-xl font-bold text-navy-800 mb-2" data-testid={`nominee-name-${awardee.slug}`}>
          {awardee.name}
        </h4>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3" data-testid={`nominee-bio-${awardee.slug}`}>
          {awardee.bio}
        </p>
        
        {award.showPublicCounts && (
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              <Vote className="inline mr-1" size={14} />
              <span data-testid={`vote-count-${awardee.slug}`}>{voteCount}</span> votes
            </div>
            {getStatusBadge()}
          </div>
        )}

        <div className="space-y-3">
          {hasVoted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <div className="text-green-600 font-semibold mb-1">✓ Vote Submitted</div>
              <div className="text-green-500 text-sm">Thank you for voting!</div>
            </div>
          ) : (
            <Dialog open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full gold-gradient text-navy-900 py-3 rounded-lg font-semibold hover-lift"
                  data-testid={`button-vote-${awardee.slug}`}
                >
                  <Vote className="mr-2" />
                  Vote Now
                </Button>
              </DialogTrigger>
              
              <DialogContent className="max-w-md" data-testid="voting-modal">
                <DialogHeader>
                  <DialogTitle>Cast Your Vote</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-navy-800">{awardee.name}</h4>
                    <p className="text-sm text-gray-600">{award.title}</p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Email *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="your@email.com" 
                                {...field} 
                                data-testid="input-voter-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <Info className="text-yellow-500 mt-1 mr-2 flex-shrink-0" size={16} />
                          <div className="text-sm">
                            <p className="text-yellow-800 font-medium">Voting Rules:</p>
                            <ul className="text-yellow-700 mt-1 space-y-1">
                              <li>• One vote per email per award category</li>
                              <li>• Votes cannot be changed once submitted</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full gold-gradient text-navy-900 py-3 rounded-xl font-bold hover-lift"
                        disabled={voteMutation.isPending}
                        data-testid="button-submit-vote"
                      >
                        {voteMutation.isPending ? "Submitting..." : "Submit Vote"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button 
            variant="outline"
            className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            onClick={shareAwardee}
            data-testid={`button-share-${awardee.slug}`}
          >
            <Share className="mr-2" size={16} />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
