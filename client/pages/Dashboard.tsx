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
      }
    } catch (err) {
      console.error("Error fetching PDFs:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
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
      } else {
        alert("Error uploading PDF");
      }
    } catch (err) {
      console.error("Error uploading PDF:", err);
      alert("Error uploading PDF");
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
      }
    } catch (err) {
      console.error("Error deleting PDF:", err);
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
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-muted-foreground text-sm mb-2">Total PDFs</p>
            <p className="text-4xl font-bold text-foreground">{stats.totalPdfs}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-muted-foreground text-sm mb-2">Questions Asked</p>
            <p className="text-4xl font-bold text-foreground">{stats.totalDoubts}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-muted-foreground text-sm mb-2">Learning Time</p>
            <p className="text-4xl font-bold text-foreground">{stats.learningTime}</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-card rounded-2xl border border-border p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Upload Your First PDF
          </h2>

          <label className="block">
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-background/50">
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
            <p className="text-center text-primary mt-4">
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
                  className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
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
      </main>
    </div>
  );
}
