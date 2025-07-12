import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserCheck, Warehouse, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SignUp = () => {
  const [signUpType, setSignUpType] = useState<"manager" | "worker" | null>(null);
  const [credentials, setCredentials] = useState({ username: "", password: "", confirmPassword: "" });
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password.trim() || !credentials.confirmPassword.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    if (credentials.password !== credentials.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Password and Confirm Password do not match.",
        variant: "destructive"
      });
      return;
    }
    // Supabase sign up logic
    const { error } = await supabase.from('users').insert([
      { name: credentials.username, password: credentials.password, type: signUpType }
    ]);
    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Sign Up Successful",
      description: `Welcome, ${credentials.username}! You can now log in.`,
    });
    navigate("/login");
  };

  if (!signUpType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Smart Warehouse System</h1>
            <p className="text-lg text-muted-foreground">Eco-friendly logistics optimization platform</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Manager Sign Up Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSignUpType("manager")}>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Warehouse Manager</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Sign up to access analytics, energy optimization, and more
                </p>
                <div className="flex items-center justify-center text-primary font-medium">
                  Sign Up as Manager
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
            {/* Worker Sign Up Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSignUpType("worker")}>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Warehouse Worker</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Sign up to track your energy savings and deliveries
                </p>
                <div className="flex items-center justify-center text-green-600 font-medium">
                  Sign Up as Worker
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Warehouse className="w-5 h-5" />
              <span>Already have an account?</span>
              <Button variant="link" onClick={() => navigate("/login")}>Sign In</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {signUpType === "manager" ? (
              <Users className="w-8 h-8 text-primary" />
            ) : (
              <UserCheck className="w-8 h-8 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {signUpType === "manager" ? "Manager Sign Up" : "Worker Sign Up"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Choose a username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Create a password"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={credentials.confirmPassword}
                onChange={(e) => setCredentials(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Sign Up
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSignUpType(null)}
              >
                Back
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp; 