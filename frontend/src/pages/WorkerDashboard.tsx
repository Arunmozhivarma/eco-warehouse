
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { LogOut, Truck, Zap, Award, TrendingUp, Target } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (reuse env variables as in ManagerDashboard)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [todaysStats, setTodaysStats] = useState({ energySaved: 0, deliveries: 0, efficiency: 0, co2Reduced: 0 });
  const [dailyEnergySavings, setDailyEnergySavings] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [totalWeeklyEnergy, setTotalWeeklyEnergy] = useState(0);
  const [liveDeliveries, setLiveDeliveries] = useState([]);

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const storedUsername = localStorage.getItem("username");
    if (userType !== "worker" || !storedUsername) {
      navigate("/login");
      return;
    }
    setUsername(storedUsername);
  }, [navigate]);

  useEffect(() => {
    // Fetch today's stats
    const fetchTodayStats = async () => {
      const { data, error } = await supabase.rpc('today_energy_and_deliveries_by_user', { username });
      if (!error && data && data.length > 0) {
        setTodaysStats({
          energySaved: data[0].energy_saved || 0,
          deliveries: data[0].deliveries || 0,
          efficiency: data[0].efficiency || 0,
          co2Reduced: data[0].co2_reduced || 0
        });
      }
    };
    // Fetch daily energy savings (last 7 days)
    const fetchDailyEnergy = async () => {
      const { data, error } = await supabase.rpc('daily_energy_savings_by_user', { username });
      if (!error && data) setDailyEnergySavings(data);
    };
    // Fetch weekly progress
    const fetchWeeklyProgress = async () => {
      const { data, error } = await supabase.rpc('weekly_progress_by_user', { username });
      if (!error && data) setWeeklyProgress(data);
    };
    // Fetch total weekly energy
    const fetchTotalWeeklyEnergy = async () => {
      const { data, error } = await supabase.rpc('total_weekly_energy_by_user', { username });
      if (!error && data && data.length > 0) setTotalWeeklyEnergy(data[0].total || 0);
    };
    if (username) {
      fetchTodayStats();
      fetchDailyEnergy();
      fetchWeeklyProgress();
      fetchTotalWeeklyEnergy();
    }
  }, [username]);

  useEffect(() => {
    // Subscribe to live deliveries for this user
    const subscription = supabase
      .channel('public:deliveries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, (payload) => {
        if (payload.new && payload.new.delivered_by === username) {
          setLiveDeliveries((prev) => [payload.new, ...prev]);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [username]);

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const handleTransport = () => {
    navigate("/transport");
  };

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
              <p className="text-xs text-muted-foreground">Efficiency today</p>
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
                <p className="text-green-700">You've saved {totalWeeklyEnergy} kWh this week!</p>
              </div>
              <Badge className="ml-auto bg-green-600">
                Top Performer
              </Badge>
            </div>
          </CardContent>
        </Card>
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
                <div className="text-3xl font-bold text-blue-600 mb-2">{weeklyProgress.length > 0 ? (weeklyProgress.reduce((a, b) => a + b.efficiency, 0) / weeklyProgress.length).toFixed(1) : '0'}%</div>
                <div className="text-sm text-blue-700">Average Weekly Efficiency</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">{todaysStats.co2Reduced}</div>
                <div className="text-sm text-orange-700">kg CO₂ Reduced This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Live Updates Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Live Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              {liveDeliveries.length === 0 ? (
                <div className="text-muted-foreground">No new deliveries yet.</div>
              ) : (
                liveDeliveries.map((delivery, idx) => (
                  <div key={delivery.id || idx} className="p-2 border-b last:border-b-0">
                    <div className="font-semibold">Delivery #{delivery.id}</div>
                    <div className="text-xs text-muted-foreground">Energy Used: {delivery.energy_used} kWh | Delivered At: {delivery.delivered_at}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkerDashboard;
