import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  Zap,
  HelpCircle,
} from "lucide-react";

interface LearningMode {
  mode: "text" | "voice" | "animated" | "doubt";
  title: string;
  description: string;
  icon: React.ReactNode;
}

const LEARNING_MODES: LearningMode[] = [
  {
    mode: "text",
    title: "Text Explanation",
    description: "Get detailed text explanations powered by AI",
    icon: "📝",
  },
  {
    mode: "voice",
    title: "Voice Explanation",
    description: "Listen to explanations in a natural voice",
    icon: "🎙️",
  },
  {
    mode: "animated",
    title: "Animated Explanation",
    description: "Visual slide-based animations",
    icon: "✨",
  },
  {
    mode: "doubt",
    title: "Ask Doubt",
    description: "Ask questions about the content",
    icon: "❓",
  },
];

export default function Learning() {
  const { pdfId } = useParams();
  const navigate = useNavigate();

  const [selectedMode, setSelectedMode] = useState<LearningMode["mode"] | null>(
    null
  );
  const [selectedText, setSelectedText] = useState("");
  const [question, setQuestion] = useState("");
  const [showTextSelector, setShowTextSelector] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("male");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/auth/login");
    }
  }, [navigate]);

  const handleSelectMode = (mode: LearningMode["mode"]) => {
    setSelectedMode(mode);
    setExplanation("");
    setSelectedText("");
    setQuestion("");
    setError("");

    if (mode !== "doubt") {
      setShowTextSelector(true);
    }
  };

  const handleGetExplanation = async () => {
    if (!selectedText) {
      setError("Please select text first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pdfId,
          selectedText,
          mode: selectedMode,
          voiceGender: selectedMode === "voice" ? voiceGender : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExplanation(data.explanation);

        // If voice mode, play audio
        if (selectedMode === "voice" && data.audioUrl) {
          playAudio(data.audioUrl);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error getting explanation");
      }
    } catch (err) {
      console.error("Error getting explanation:", err);
      setError("Failed to get explanation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskDoubt = async () => {
    if (!question) {
      setError("Please enter a question first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/doubts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pdfId,
          question,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExplanation(data.answer);
        setQuestion("");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error asking question");
      }
    } catch (err) {
      console.error("Error asking doubt:", err);
      setError("Failed to ask question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
  };

  const handleBackClick = () => {
    if (selectedMode) {
      setSelectedMode(null);
      setExplanation("");
      setShowTextSelector(false);
    } else {
      navigate("/dashboard");
    }
  };

  // Mode Selection View
  if (!selectedMode) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="ghost"
              className="text-foreground hover:bg-card"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Learning Modes</h1>
          </div>
        </header>

        {/* Mode Selection Grid */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-muted-foreground mb-8">
            Choose how you want to learn from your PDF
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LEARNING_MODES.map((mode) => (
              <button
                key={mode.mode}
                onClick={() => handleSelectMode(mode.mode)}
                className="group bg-card/50 hover:bg-card border border-border hover:border-primary/50 rounded-2xl p-8 text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/10 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{mode.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {mode.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-foreground/70 transition-colors">{mode.description}</p>
                <div className="mt-6 inline-block">
                  <Button className="bg-primary text-foreground hover:bg-primary/90 group-hover:shadow-lg group-hover:shadow-primary/20">
                    Start
                  </Button>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Learning View
  const mode = LEARNING_MODES.find((m) => m.mode === selectedMode)!;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            onClick={handleBackClick}
            variant="ghost"
            className="text-foreground hover:bg-card"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{mode.title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Error Display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            {/* Text Selector for Explanation Modes */}
            {showTextSelector && selectedMode !== "doubt" && (
              <div className="bg-card rounded-2xl border border-border p-8 mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Select Text to Explain
                </h2>
                <textarea
                  value={selectedText}
                  onChange={(e) => setSelectedText(e.target.value)}
                  placeholder="Paste or type the text you want to learn about..."
                  className="w-full h-40 bg-background border border-border text-foreground rounded-lg p-4 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground/50 transition-all duration-200 hover:border-border/50"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedText.length} characters
                </p>
              </div>
            )}

            {/* Question Input for Doubt Mode */}
            {selectedMode === "doubt" && (
              <div className="bg-card rounded-2xl border border-border p-8 mb-8">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Ask Your Question
                </h2>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question about the content..."
                  className="w-full h-40 bg-background border border-border text-foreground rounded-lg p-4 focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-muted-foreground/50 transition-all duration-200 hover:border-border/50"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {question.length} characters
                </p>
              </div>
            )}

            {/* Voice Mode Options */}
            {selectedMode === "voice" && (
              <div className="bg-card rounded-2xl border border-border p-8 mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Voice Preference
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setVoiceGender("male")}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      voiceGender === "male"
                        ? "bg-primary text-foreground"
                        : "bg-background border border-border text-foreground hover:border-primary"
                    }`}
                  >
                    🎤 Male Voice
                  </button>
                  <button
                    onClick={() => setVoiceGender("female")}
                    className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                      voiceGender === "female"
                        ? "bg-primary text-foreground"
                        : "bg-background border border-border text-foreground hover:border-primary"
                    }`}
                  >
                    🎤 Female Voice
                  </button>
                </div>
              </div>
            )}

            {/* Explanation/Answer Display */}
            {explanation && (
              <div className="bg-card rounded-2xl border border-border p-8 mb-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {selectedMode === "doubt" ? "Answer" : "Explanation"}
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {explanation}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => {
                      setExplanation("");
                      setSelectedText("");
                      setQuestion("");
                    }}
                    variant="outline"
                    className="border-border text-foreground hover:bg-card"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {selectedMode === "doubt" ? "Ask Another" : "New Question"}
                  </Button>
                  {selectedMode === "voice" && (
                    <Button
                      onClick={() =>
                        setIsPlaying(!isPlaying)
                      }
                      className="bg-primary text-foreground hover:bg-primary/90"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Get Explanation/Answer Button */}
            {!explanation && (
              <Button
                onClick={selectedMode === "doubt" ? handleAskDoubt : handleGetExplanation}
                disabled={isLoading || (selectedMode === "doubt" ? !question : !selectedText)}
                className="w-full bg-primary text-foreground hover:bg-primary/90 py-6 text-lg font-semibold rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Zap className="w-5 h-5 mr-2 animate-spin" />
                    {selectedMode === "doubt" ? "Getting Answer..." : "Generating Explanation..."}
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    {selectedMode === "doubt" ? "Ask Question" : "Get Explanation"}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Sidebar - Real-time Status */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
              <h3 className="font-semibold text-foreground mb-6">
                Session Status
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Current Mode
                  </p>
                  <p className="font-semibold text-foreground">{mode.title}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Status
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <p className="font-semibold text-foreground">
                      {isLoading ? "Processing" : "Ready"}
                    </p>
                  </div>
                </div>

                {selectedMode === "doubt" && question && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Your Question
                    </p>
                    <p className="text-sm text-foreground line-clamp-3">
                      {question}
                    </p>
                  </div>
                )}

                {selectedMode !== "doubt" && selectedText && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Text Selected
                    </p>
                    <p className="text-sm text-foreground line-clamp-3">
                      {selectedText}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => setSelectedMode(null)}
                  variant="outline"
                  className="w-full border-border text-foreground hover:bg-card mt-6"
                >
                  Change Mode
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
