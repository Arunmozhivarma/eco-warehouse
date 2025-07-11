
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, TrendingDown, Award, LogOut, Zap, Leaf } from "lucide-react";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const storedUsername = localStorage.getItem("username");
    
    if (userType !== "manager" || !storedUsername) {
      navigate("/login");
      return;
    }
    
    setUsername(storedUsername);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("username");
    navigate("/login");
  };

  // Mock data for demonstration
  const workerLeaderboard = [
    { name: "John Smith", energySaved: 2845, deliveries: 124, efficiency: 95 },
    { name: "Sarah Johnson", energySaved: 2632, deliveries: 118, efficiency: 92 },
    { name: "Mike Chen", energySaved: 2401, deliveries: 108, efficiency: 89 },
    { name: "Emma Davis", energySaved: 2198, deliveries: 102, efficiency: 87 },
    { name: "Alex Wilson", energySaved: 1987, deliveries: 95, efficiency: 83 }
  ];

  const monthlyEnergyData = [
    { month: "Jan", saved: 18500, target: 20000 },
    { month: "Feb", saved: 22300, target: 20000 },
    { month: "Mar", saved: 19800, target: 20000 },
    { month: "Apr", saved: 25100, target: 20000 },
    { month: "May", saved: 23400, target: 20000 },
    { month: "Jun", saved: 26700, target: 20000 }
  ];

  const departmentEfficiency = [
    { name: "Shipping", value: 35, color: "#10b981" },
    { name: "Receiving", value: 28, color: "#3b82f6" },
    { name: "Storage", value: 22, color: "#f59e0b" },
    { name: "Packaging", value: 15, color: "#ef4444" }
  ];

  const totalEnergySaved = workerLeaderboard.reduce((sum, worker) => sum + worker.energySaved, 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {username}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Energy Saved</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalEnergySaved.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">kWh this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workerLeaderboard.length}</div>
              <p className="text-xs text-muted-foreground">Currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">91.2%</div>
              <p className="text-xs text-muted-foreground">+2.4% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Reduced</CardTitle>
              <Leaf className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2</div>
              <p className="text-xs text-muted-foreground">tons this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Energy Savings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Energy Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyEnergyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
                    <Bar dataKey="saved" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Department Efficiency */}
          <Card>
            <CardHeader>
              <CardTitle>Department Energy Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentEfficiency}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentEfficiency.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {departmentEfficiency.map((dept, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: dept.color }}
                    />
                    <span className="text-sm">{dept.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Worker Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Worker Energy Savings Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workerLeaderboard.map((worker, index) => (
                <div 
                  key={worker.name}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <span className="font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{worker.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {worker.deliveries} deliveries completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {worker.energySaved.toLocaleString()} kWh
                      </div>
                      <Badge variant="outline">
                        {worker.efficiency}% efficient
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerDashboard;
