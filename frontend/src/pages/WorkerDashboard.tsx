
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { LogOut, Truck, Zap, Award, TrendingUp, Target } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabaseClient";

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [todaysStats, setTodaysStats] = useState({ energySaved: 0, deliveries: 0, efficiency: 0, co2Reduced: 0 });
  const [dailyEnergySavings, setDailyEnergySavings] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [totalWeeklyEnergy, setTotalWeeklyEnergy] = useState(0);
  const [liveDeliveries, setLiveDeliveries] = useState([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [energyToday, setEnergyToday] = useState(0);
  const [deliveriesToday, setDeliveriesToday] = useState(0);
  const [userUuid, setUserUuid] = useState<string | null>(null);

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
    if (username) {
      supabase
        .from('users')
        .select('id')
        .eq('name', username)
        .single()
        .then(({ data, error }) => {
          if (data) setUserUuid(data.id);
        });
    }
  }, [username]);

  useEffect(() => {
    // Fetch today's stats
    const fetchTodayStats = async () => {
      if (!userUuid) return;
      const { data, error } = await supabase.rpc('today_energy_and_deliveries_by_user', { user_id: userUuid });
      if (!error && data && data.length > 0) {
        setTodaysStats({
          energySaved: data[0].energy_saved || 0,
          deliveries: data[0].deliveries || 0,
          efficiency: data[0].efficiency || 0,
          co2Reduced: data[0].co2_reduced || 0
        });
      }
    };
    // Fetch all daily energy savings (all days)
    const fetchAllEnergy = async () => {
      if (!userUuid) return;
      const { data, error } = await supabase.rpc('all_energy_savings_by_user', { user_id: userUuid });
      if (!error && data) setDailyEnergySavings(data);
    };
    // Fetch weekly progress
    const fetchWeeklyProgress = async () => {
      if (!userUuid) return;
      const { data, error } = await supabase.rpc('weekly_progress_by_user', { user_id: userUuid });
      if (!error && data) setWeeklyProgress(data);
    };
    // Fetch total weekly energy
    const fetchTotalWeeklyEnergy = async () => {
      if (!userUuid) return;
      const { data, error } = await supabase.rpc('total_weekly_energy_by_user', { user_id: userUuid });
      if (!error && data && data.length > 0) setTotalWeeklyEnergy(data[0].total || 0);
    };
    // Fetch total deliveries and total energy used from Supabase
    const fetchDeliveryAnalytics = async () => {
      const { data, error } = await supabase.from('deliveries').select('energy_used');
      if (!error && data) {
        setTotalDeliveries(data.length);
        setTotalEnergy(data.reduce((sum, d) => sum + (d.energy_used || 0), 0));
      }
    };
    // Fetch today's deliveries and energy from Supabase
    const fetchTodayStatsSupabase = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isoToday = today.toISOString();
      const { data, error } = await supabase
        .from('deliveries')
        .select('energy_used, delivered_at')
        .gte('delivered_at', isoToday);
      if (!error && data) {
        setDeliveriesToday(data.length);
        setEnergyToday(data.reduce((sum, d) => sum + (d.energy_used || 0), 0));
      }
    };
    if (username && userUuid) {
      fetchTodayStats();
      fetchAllEnergy();
      fetchWeeklyProgress();
      fetchTotalWeeklyEnergy();
      fetchDeliveryAnalytics();
      fetchTodayStatsSupabase();
    }
  }, [username, userUuid]);

  useEffect(() => {
    // Subscribe to live deliveries for this user
    const subscription = supabase
      .channel('public:deliveries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, (payload) => {
        if (payload.new && (payload.new as any).delivered_by === username) {
          setLiveDeliveries((prev) => [(payload.new as any), ...prev]);
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

  // Pad dailyEnergySavings to always show all 7 days
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayIdx = new Date().getDay();
  const last7Days = Array.from({ length: 7 }, (_, i) => daysOfWeek[(todayIdx - 6 + i + 7) % 7]);

  const paddedData = useMemo(() => {
    const map = Object.fromEntries((dailyEnergySavings || []).map(d => [d.day, d]));
    return last7Days.map(day => ({
      day,
      saved: map[day]?.saved || 0,
      target: 50
    }));
  }, [dailyEnergySavings]);

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Energy Saved Today</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{energyToday}</div>
              <p className="text-xs text-muted-foreground">kWh saved</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deliveries Today</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveriesToday}</div>
              <p className="text-xs text-muted-foreground">completed today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Energy Saved This Week</CardTitle>
              <Award className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{totalEnergy}</div>
              <p className="text-xs text-muted-foreground">kWh this week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{totalDeliveries}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>
        {/* Achievement Badge */}
        {/* Daily Energy Savings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Energy Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyEnergySavings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value, name, props) => [`${value} kWh`, "Energy Saved"]} labelFormatter={label => `Day: ${label}`} />
                  <Line
                    type="monotone"
                    dataKey="saved"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        {/* Removed Live Deliveries section */}
      </div>
    </div>
  );
};

export default WorkerDashboard;
