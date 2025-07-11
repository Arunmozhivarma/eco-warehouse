
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { LogOut, Truck, Zap, Award, TrendingUp, Target } from "lucide-react";

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const storedUsername = localStorage.getItem("username");
    
    if (userType !== "worker" || !storedUsername) {
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

  const handleTransport = () => {
    navigate("/transport");
  };

  // Mock data for demonstration
  const dailyEnergySavings = [
    { day: "Mon", saved: 45, target: 50 },
    { day: "Tue", saved: 52, target: 50 },
    { day: "Wed", saved: 48, target: 50 },
    { day: "Thu", saved: 58, target: 50 },
    { day: "Fri", saved: 55, target: 50 },
    { day: "Sat", saved: 42, target: 50 },
    { day: "Sun", saved: 38, target: 50 }
  ];

  const weeklyProgress = [
    { week: "Week 1", efficiency: 85, deliveries: 45 },
    { week: "Week 2", efficiency: 88, deliveries: 52 },
    { week: "Week 3", efficiency: 91, deliveries: 48 },
    { week: "Week 4", efficiency: 94, deliveries: 58 }
  ];

  const todaysStats = {
    energySaved: 55,
    deliveries: 12,
    efficiency: 94,
    co2Reduced: 0.8
  };

  const totalWeeklyEnergy = dailyEnergySavings.reduce((sum, day) => sum + day.saved, 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Worker Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {username}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleTransport} className="bg-green-600 hover:bg-green-700">
              <Truck className="w-4 h-4 mr-2" />
              Transport
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Today's Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Energy Saved Today</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{todaysStats.energySaved}</div>
              <p className="text-xs text-muted-foreground">kWh saved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deliveries</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysStats.deliveries}</div>
              <p className="text-xs text-muted-foreground">completed today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Rate</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysStats.efficiency}%</div>
              <p className="text-xs text-muted-foreground">+3% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CO₂ Reduced</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaysStats.co2Reduced}</div>
              <p className="text-xs text-muted-foreground">kg today</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badge */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Eco-Warrior Achievement!</h3>
                <p className="text-green-700">You've saved {totalWeeklyEnergy} kWh this week, exceeding your target by 15%</p>
              </div>
              <Badge className="ml-auto bg-green-600">
                Top Performer
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Energy Savings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Energy Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyEnergySavings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
                    <Area 
                      type="monotone" 
                      dataKey="saved" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Impact Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">{totalWeeklyEnergy}</div>
                <div className="text-sm text-green-700">kWh Saved This Week</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">89%</div>
                <div className="text-sm text-blue-700">Average Weekly Efficiency</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">4.2</div>
                <div className="text-sm text-orange-700">kg CO₂ Reduced This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkerDashboard;
