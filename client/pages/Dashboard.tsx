import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Upload, File, Trash2, Play } from "lucide-react";

interface PDFFile {
  _id: string;
  fileName: string;
  uploadDate: string;
  fileSize: number;
  status: "processing" | "completed" | "error";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalPdfs: 0,
    totalDoubts: 0,
    learningTime: "0h",
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
      return;
    }

    // Fetch user's PDFs and stats
    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/pdfs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPdfs(data.pdfs);
        setStats(data.stats);
      } else if (response.status === 401) {
        navigate("/auth/login");
      } else {
        setError("Failed to load PDFs. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching PDFs:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    if (file.type !== "application/pdf") {
      setUploadError("Please upload a PDF file only");
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      setUploadError(`File size (${fileSizeMB.toFixed(1)}MB) exceeds 50MB limit`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const newPdf = await response.json();
        setPdfs((prev) => [newPdf, ...prev]);
        setStats((prev) => ({
          ...prev,
          totalPdfs: prev.totalPdfs + 1,
        }));
        setUploadError("");
        // Reset file input
        e.target.value = "";
      } else {
        const errorData = await response.json();
        setUploadError(errorData.message || "Error uploading PDF");
      }
    } catch (err) {
      console.error("Error uploading PDF:", err);
      setUploadError("Network error during upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePdf = async (pdfId: string) => {
    if (!confirm("Are you sure you want to delete this PDF?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/pdfs/${pdfId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setPdfs((prev) => prev.filter((p) => p._id !== pdfId));
        setStats((prev) => ({
          ...prev,
          totalPdfs: prev.totalPdfs - 1,
        }));
      } else {
        setError("Failed to delete PDF. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting PDF:", err);
      setError("Network error. Please try again.");
    }
  };

  const handleStartLearning = (pdfId: string) => {
    navigate(`/learning/${pdfId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-foreground">🎓</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Talk To Learn</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-border text-foreground hover:bg-card"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Messages */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading your PDFs...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl border border-border/50 p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <p className="text-muted-foreground text-sm mb-3 font-medium">Total PDFs</p>
                <p className="text-4xl font-bold text-primary">{stats.totalPdfs}</p>
              </div>
              <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl border border-border/50 p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <p className="text-muted-foreground text-sm mb-3 font-medium">Questions Asked</p>
                <p className="text-4xl font-bold text-primary">{stats.totalDoubts}</p>
              </div>
              <div className="bg-gradient-to-br from-card to-card/50 rounded-2xl border border-border/50 p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <p className="text-muted-foreground text-sm mb-3 font-medium">Learning Time</p>
                <p className="text-4xl font-bold text-primary">{stats.learningTime}</p>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-card rounded-2xl border border-border p-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Upload Your First PDF
              </h2>

              {uploadError && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 mb-6">
                  {uploadError}
                </div>
              )}

              <label className="block">
                <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  isUploading
                    ? "border-primary bg-primary/5 cursor-not-allowed"
                    : "border-border hover:border-primary/50 cursor-pointer bg-background/50"
                }`}>
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-foreground font-semibold mb-2">
                    Drop your PDF here or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Maximum file size: 50MB
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </div>
              </label>
              {isUploading && (
                <p className="text-center text-primary mt-4 font-semibold">
                  Uploading and processing PDF...
                </p>
              )}
            </div>

            {/* PDFs List */}
            {pdfs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Your Learning Materials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pdfs.map((pdf) => (
                    <div
                      key={pdf._id}
                      className="bg-card/50 rounded-2xl border border-border/50 p-6 hover:bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <File className="w-8 h-8 text-primary mt-1" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {pdf.fileName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {(pdf.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(pdf.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleStartLearning(pdf._id)}
                          className="flex-1 bg-primary text-foreground hover:bg-primary/90"
                          disabled={pdf.status !== "completed"}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {pdf.status === "processing" ? "Processing..." : "Learn"}
                        </Button>
                        <Button
                          onClick={() => handleDeletePdf(pdf._id)}
                          variant="outline"
                          className="border-border text-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {pdf.status === "error" && (
                        <p className="text-xs text-destructive mt-2">
                          Error processing PDF
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {pdfs.length === 0 && !isUploading && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  Upload a PDF to start learning
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
