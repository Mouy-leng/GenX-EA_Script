import { Button } from "@/components/ui/button";

function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Learn at Your Own Pace
        </h2>
        <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Discover educational resources organized by skill level, from beginner to advanced.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 transition-colors duration-200"
          >
            Explore Resources
          </Button>
          <Button 
            size="lg"
            variant="outline" 
            className="border-2 border-white text-white hover:bg-white hover:text-primary transition-colors duration-200"
          >
            Join Community
          </Button>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
