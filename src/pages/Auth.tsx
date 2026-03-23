import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Package, Mail, Lock, User, ArrowRight } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  if (user) {
    navigate("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials" ? "Invalid email or password." : error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(signupEmail);
      passwordSchema.parse(signupPassword);
      nameSchema.parse(signupName);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Validation Error", description: error.errors[0].message, variant: "destructive" });
        return;
      }
    }
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);
    if (error) {
      toast({
        title: error.message.includes("already registered") ? "Account Exists" : "Signup Failed",
        description: error.message.includes("already registered")
          ? "This email is already registered. Please login instead."
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Account Created!", description: "You have successfully signed up." });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center mb-4">
            <Package className="h-6 w-6 text-background" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Local Government Authority</h1>
          <p className="text-sm text-muted-foreground mt-1">Asset Management System</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {activeTab === "login" ? "Sign in" : "Create account"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "login"
                ? "Enter your email and password"
                : "Fill in your details to get started"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex border border-border rounded-lg p-0.5 mb-6">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "login"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "signup"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10 h-11 bg-muted/50 border-border"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-muted/50 border-border"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 mt-2 bg-foreground text-background hover:bg-foreground/90" disabled={isLoading}>
                {isLoading ? "Signing in..." : (
                  <>Sign in <ArrowRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </form>
          )}

          {/* Signup form */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="signup-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10 h-11 bg-muted/50 border-border"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10 h-11 bg-muted/50 border-border"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 6 characters"
                    className="pl-10 h-11 bg-muted/50 border-border"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 mt-2 bg-foreground text-background hover:bg-foreground/90" disabled={isLoading}>
                {isLoading ? "Creating account..." : (
                  <>Create Account <ArrowRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Secure asset tracking for your organization
        </p>
      </div>
    </div>
  );
}
