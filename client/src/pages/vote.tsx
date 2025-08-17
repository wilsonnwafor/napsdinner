import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import VotingCard from "@/components/awards/voting-card";
import { Skeleton } from "@/components/ui/skeleton";

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
  description: string;
  showPublicCounts: boolean;
  awardees: Awardee[];
}

export default function Vote() {
  const [match, params] = useRoute("/vote/:slug?");
  const selectedSlug = params?.slug;

  const { data: awards, isLoading, error } = useQuery<Award[]>({
    queryKey: ['/api/awards'],
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Failed to load awards</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
        <Footer />
      </div>
    );
  }

  // If specific slug is provided, show only that awardee
  if (selectedSlug && awards) {
    const selectedAwardee = awards
      .flatMap(award => award.awardees.map(awardee => ({ ...awardee, award })))
      .find(awardee => awardee.slug === selectedSlug);

    if (selectedAwardee) {
      return (
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-20">
            <VotingCard
              awardee={selectedAwardee}
              award={selectedAwardee.award}
              showTitle={true}
            />
          </div>
          <Footer />
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gold-50" data-testid="awards-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-playfair font-bold text-navy-900 mb-4">Awards & Recognition</h1>
          <p className="text-xl text-gray-600">Vote for outstanding members of our community</p>
        </div>
      </section>

      {/* Awards Grid */}
      <section className="py-20" data-testid="awards-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 space-y-4">
                  <Skeleton className="w-full h-48" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : awards && awards.length > 0 ? (
            <div className="space-y-16">
              {awards.map((award) => (
                <div key={award.id} className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-playfair font-bold text-navy-900 mb-2">
                      {award.title}
                    </h2>
                    {award.description && (
                      <p className="text-lg text-gray-600">{award.description}</p>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {award.awardees.map((awardee) => (
                      <VotingCard
                        key={awardee.id}
                        awardee={awardee}
                        award={award}
                        showTitle={false}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-gray-600 mb-4">No Awards Available</h3>
              <p className="text-gray-500">Awards and nominees will be announced soon.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
