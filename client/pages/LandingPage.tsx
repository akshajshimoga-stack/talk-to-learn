import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Background animated gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent opacity-20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl text-center animate-slide-up">
        {/* Logo/Title Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-foreground">🎓</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Talk To Learn
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-6">
            Your AI-Powered Learning Companion
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
            <div className="text-3xl mb-2">📄</div>
            <h3 className="font-semibold text-foreground mb-2">Upload PDFs</h3>
            <p className="text-sm text-muted-foreground">
              Extract and analyze your learning materials
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold text-foreground mb-2">AI Explanations</h3>
            <p className="text-sm text-muted-foreground">
              Get intelligent explanations in multiple formats
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold text-foreground mb-2">Learn Your Way</h3>
            <p className="text-sm text-muted-foreground">
              Text, voice, or animated explanations
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Link to="/auth/login">
          <Button
            className="px-12 py-7 text-lg font-bold italic bg-primary text-foreground hover:bg-primary/90 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            START LEARNING
          </Button>
        </Link>

        {/* Additional Info */}
        <p className="mt-8 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
