
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, TrendingDown, Award, LogOut, Zap, Leaf } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (replace with your actual keys)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [monthlyEnergyData, setMonthlyEnergyData] = useState([]);
  const [departmentEfficiency, setDepartmentEfficiency] = useState([]);
  const [totalEnergySaved, setTotalEnergySaved] = useState(0);
  const [totalDeliveriesToday, setTotalDeliveriesToday] = useState(0);
  const [workerLeaderboard, setWorkerLeaderboard] = useState([]);
  const [liveDeliveries, setLiveDeliveries] = useState([]);

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const storedUsername = localStorage.getItem("username");
    if (userType !== "manager" || !storedUsername) {
      navigate("/login");
      return;
    }
    setUsername(storedUsername);
  }, [navigate]);

  useEffect(() => {
    // Fetch monthly energy savings
    const fetchMonthlyEnergy = async () => {
      const { data, error } = await supabase.rpc('monthly_energy_savings');
      if (!error && data) setMonthlyEnergyData(data);
    };
    // Fetch department efficiency
    const fetchDepartmentEfficiency = async () => {
      const { data, error } = await supabase.from('department_efficiency').select('*');
      if (!error && data) {
        setDepartmentEfficiency(data.map((dept, idx) => ({
          name: dept.department_name,
          value: dept.avg_energy_used,
          color: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][idx % 4]
        })));
      }
    };
    // Fetch today's stats
    const fetchTodayStats = async () => {
      const { data, error } = await supabase.rpc('today_energy_and_deliveries');
      if (!error && data && data.length > 0) {
        setTotalEnergySaved(data[0].energy_saved || 0);
        setTotalDeliveriesToday(data[0].deliveries || 0);
      }
    };
    // Fetch worker leaderboard
    const fetchWorkerLeaderboard = async () => {
      const { data, error } = await supabase.rpc('worker_leaderboard');
      if (!error && data) setWorkerLeaderboard(data);
    };
    fetchMonthlyEnergy();
    fetchDepartmentEfficiency();
    fetchTodayStats();
    fetchWorkerLeaderboard();
  }, []);

  useEffect(() => {
    // Subscribe to live deliveries
    const subscription = supabase
      .channel('public:deliveries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, (payload) => {
        setLiveDeliveries((prev) => [payload.new, ...prev]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("username");
    navigate("/login");
  };

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
              <CardTitle className="text-sm font-medium">Total Energy Saved Today</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalEnergySaved.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">kWh today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries Today</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDeliveriesToday}</div>
              <p className="text-xs text-muted-foreground">completed today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departmentEfficiency.length > 0 ? (departmentEfficiency.reduce((a, b) => a + b.value, 0) / departmentEfficiency.length).toFixed(1) : '0'}%</div>
              <p className="text-xs text-muted-foreground">Avg. department efficiency</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Deliveries</CardTitle>
              <Leaf className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveDeliveries.length}</div>
              <p className="text-xs text-muted-foreground">since you opened dashboard</p>
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
        {/* Live Updates Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Live Warehouse Activity</CardTitle>
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

export default ManagerDashboard;
