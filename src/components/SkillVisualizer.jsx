import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

// Skill Colors
const COLORS = [
  "#845EC2", "#FF6F91", "#FF9671", "#FFC75F",
  "#F9F871", "#2C73D2", "#0081CF", "#008E9B",
];

export default function SkillVisualizer() {
  const [skillData, setSkillData] = useState([]);
  const [certsByMonth, setCertsByMonth] = useState([]);
  const [selectedChart, setSelectedChart] = useState("skills");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not logged in");
      return;
    }

    const { data, error } = await supabase
      .from("certificates")
      .select("skills, created_at")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
      return;
    }

    const skillCount = {};
    const monthCount = {};

    data.forEach((item) => {
      // Count skills
      if (item.skills) {
        item.skills
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .forEach((skill) => {
            skillCount[skill] = (skillCount[skill] || 0) + 1;
          });
      }

      // Count by month
      const month = new Date(item.created_at).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      monthCount[month] = (monthCount[month] || 0) + 1;
    });

    const formattedSkills = Object.entries(skillCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    const formattedMonths = Object.entries(monthCount)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(`1 ${a.month}`) - new Date(`1 ${b.month}`));

    setSkillData(formattedSkills);
    setCertsByMonth(formattedMonths);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-10">
      {/* Dropdown to select chart */}
      <div className="mb-6 text-center">
        <label className="text-white font-medium mr-3 text-lg">Select Chart:</label>
        <select
          value={selectedChart}
          onChange={(e) => setSelectedChart(e.target.value)}
          className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-md text-white border border-white/30"
        >
          <option className="bg-black" value="skills">🧠 Skill Distribution</option>
          <option className="bg-black" value="certs">📈 Certificates Per Month</option>
        </select>
      </div>

      {/* Skill Distribution Pie Chart */}
      {selectedChart === "skills" && (
        <div className="bg-white/10 backdrop-blur-md border border-white/30 text-white shadow-xl rounded-2xl p-6">
          <h2 className="text-3xl font-bold text-center text-pink-400 mb-6">
             Skill Distribution
          </h2>
          {skillData.length === 0 ? (
            <p className="text-center text-gray-200">No skills found.</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={skillData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={60}
                  isAnimationActive
                >
                  {skillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    color: "#fff",
                    borderRadius: "10px",
                    border: "1px solid #444",
                  }}
                />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Certificates Per Month Line Chart */}
      {selectedChart === "certs" && (
        <div className="bg-white/10 backdrop-blur-md border border-white/30 text-white shadow-xl rounded-2xl p-6 mt-10">
          <h2 className="text-3xl font-bold text-center text-yellow-300 mb-6">
            📈 Certificates Uploaded Per Month
          </h2>
          {certsByMonth.length === 0 ? (
            <p className="text-center text-gray-200">No certificates uploaded yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={certsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="month" stroke="#fff" />
                <YAxis allowDecimals={false} stroke="#fff" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111",
                    color: "#fff",
                    borderRadius: "10px",
                    border: "1px solid #444",
                  }}
                />
                <Legend />
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  dot={{ fill: "#00C49F", stroke: "#fff", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}
