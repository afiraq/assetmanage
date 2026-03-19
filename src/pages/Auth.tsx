import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Package, LogIn, UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";
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

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
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
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        <div className="relative z-10 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-glow">
            <Package className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-primary-foreground tracking-tight">
              Asset Management
            </h1>
            <p className="text-lg text-primary-foreground/60 max-w-sm mx-auto">
              Track, manage, and optimize your organization's assets with ease.
            </p>
          </div>
          <div className="flex items-center justify-center gap-8 pt-4">
            {[
              { label: "Assets Tracked", value: "10K+" },
              { label: "Organizations", value: "500+" },
              { label: "Uptime", value: "99.9%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">{stat.value}</div>
                <div className="text-xs text-primary-foreground/50 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary shadow-glow">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Asset Management</span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {activeTab === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-muted-foreground">
              {activeTab === "login"
                ? "Enter your credentials to access your account"
                : "Fill in your details to get started"}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg bg-muted p-1 gap-1">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "login"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="h-4 w-4" />
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </button>
          </div>

          {/* Login form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
                {isLoading ? "Logging in..." : (
                  <>Sign in <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </form>
          )}

          {/* Signup form */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 6 characters"
                    className="pl-10"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 gap-2" disabled={isLoading}>
                {isLoading ? "Creating account..." : (
                  <>Create Account <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
