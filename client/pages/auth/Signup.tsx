import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!formData.confirmPassword) {
      setError("Please confirm your password");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Store token and user
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Add to login history
        const history = localStorage.getItem("loginHistory");
        const loginHistory = history ? JSON.parse(history) : [];
        const updatedHistory = [
          formData.email.trim(),
          ...loginHistory,
        ].slice(0, 5);
        localStorage.setItem("loginHistory", JSON.stringify(updatedHistory));

        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "An error occurred during signup");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent opacity-20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground mb-8">
            Join Talk To Learn today
          </p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                required
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                At least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
                required
              />
              {formData.confirmPassword && formData.password && (
                <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium ${
                  formData.password === formData.confirmPassword
                    ? "bg-green-500/10 text-green-400"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {formData.password === formData.confirmPassword ? "✓" : "✗"}
                  <span>{formData.password === formData.confirmPassword
                    ? "Passwords match"
                    : "Passwords do not match"}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword}
              className="w-full bg-primary text-foreground hover:bg-primary/90 font-semibold py-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
