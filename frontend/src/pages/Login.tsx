
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserCheck, Warehouse, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [loginType, setLoginType] = useState<"manager" | "worker" | null>(null);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username.trim() || !credentials.password.trim()) {
      toast({
        title: "Invalid Credentials",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    // Store login info in localStorage (in real app, use proper authentication)
    localStorage.setItem("userType", loginType!);
    localStorage.setItem("username", credentials.username);
    
    toast({
      title: "Login Successful",
      description: `Welcome, ${credentials.username}!`,
    });

    // Navigate to appropriate dashboard
    if (loginType === "manager") {
      navigate("/manager-dashboard");
    } else {
      navigate("/worker-dashboard");
    }
  };

  if (!loginType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">Smart Warehouse System</h1>
            <p className="text-lg text-muted-foreground">Eco-friendly logistics optimization platform</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Manager Login Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLoginType("manager")}>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Warehouse Manager</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Access comprehensive analytics, energy optimization reports, and worker performance metrics
                </p>
                <div className="flex items-center justify-center text-primary font-medium">
                  Continue as Manager
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            {/* Worker Login Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLoginType("worker")}>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Warehouse Worker</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  View your energy savings, access transport simulation, and track your daily performance
                </p>
                <div className="flex items-center justify-center text-green-600 font-medium">
                  Continue as Worker
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Warehouse className="w-5 h-5" />
              <span>Reducing warehouse energy consumption through smart optimization</span>
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
            {loginType === "manager" ? (
              <Users className="w-8 h-8 text-primary" />
            ) : (
              <UserCheck className="w-8 h-8 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {loginType === "manager" ? "Manager Login" : "Worker Login"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Login
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLoginType(null)}
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

export default Login;
