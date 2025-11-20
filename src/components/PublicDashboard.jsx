import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

export default function PublicDashboard() {
  const { userId } = useParams();

  const [certs, setCerts] = useState([]);
  const [skills, setSkills] = useState({});
  const [monthlyUploads, setMonthlyUploads] = useState([]);
  const [aiSummary, setAiSummary] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState("");

  const COLORS = ["#00F5FF", "#7DF9FF", "#6A5ACD", "#9A4DFF", "#0095FF"];

  useEffect(() => {
    fetchPublicData();
  }, []);

  async function fetchPublicData() {
    const { data: certData } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId);

    setCerts(certData || []);

    // SKILL CALC
    const skillMap = {};
    certData?.forEach((c) => {
      (c.skills?.split(",") || []).forEach((s) => {
        const skill = s.trim();
        if (skill) skillMap[skill] = (skillMap[skill] || 0) + 1;
      });
    });
    setSkills(skillMap);

    // MONTHLY UPLOADS
    const monthly = {};
    certData?.forEach((c) => {
      const m = new Date(c.created_at).toLocaleString("default", {
        month: "short",
      });
      monthly[m] = (monthly[m] || 0) + 1;
    });

    setMonthlyUploads(
      Object.entries(monthly).map(([month, count]) => ({ month, count }))
    );

    generateSummary(skillMap);
    generateRecommendation(skillMap);
  }

  function generateSummary(skillMap) {
    if (!Object.keys(skillMap).length) {
      setAiSummary("No certificates uploaded yet.");
      return;
    }

    const strongest = Object.entries(skillMap).sort((a, b) => b[1] - a[1])[0];

    setAiSummary(
      `The user's strongest verified skill is **${strongest[0]}**, based on certification frequency.`
    );
  }

  function generateRecommendation(skillMap) {
    const keys = Object.keys(skillMap).map((s) => s.toLowerCase());

    if (keys.includes("aws") || keys.includes("cloud")) {
      setAiRecommendation("Recommended Next: AWS Solutions Architect Associate 🌩️");
      return;
    }
    if (keys.includes("python") || keys.includes("ml")) {
      setAiRecommendation("Recommended Next: TensorFlow Developer Certification 🤖");
      return;
    }

    setAiRecommendation("Suggested Path: Cloud, DevOps, or Data Engineering 🚀");
  }

  return (
    <div className="min-h-screen px-6 py-10 text-white">

      <h1 className="text-5xl font-extrabold 
        text-transparent bg-clip-text 
        bg-gradient-to-r from-[#00F5FF] to-[#9A4DFF]
        drop-shadow-[0_0_15px_#00F5FF] text-center mb-12">
        🌐 Public Dashboard
      </h1>

      {/* GRID CARD STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">

        <StatCard title="Total Certificates" value={certs.length} color="#00F5FF" />

        <StatCard
          title="Unique Skills"
          value={Object.keys(skills).length}
          color="#7DF9FF"
        />

        <StatCard
          title="Strongest Skill"
          value={
            Object.keys(skills).length
              ? Object.entries(skills).sort((a, b) => b[1] - a[1])[0][0]
              : "N/A"
          }
          color="#9A4DFF"
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">

        <ChartBox title="📈 Monthly Upload Trend">
          <LineChart width={350} height={250} data={monthlyUploads}>
            <CartesianGrid stroke="rgba(255,255,255,0.2)" />
            <XAxis stroke="#fff" dataKey="month" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#00F5FF" strokeWidth={3} />
          </LineChart>
        </ChartBox>

        <ChartBox title="🔮 Skill Distribution">
          <PieChart width={350} height={250}>
            <Pie
              cx={170}
              cy={125}
              outerRadius={90}
              data={Object.entries(skills).map(([name, value]) => ({
                name,
                value,
              }))}
              label
            >
              {Object.entries(skills).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartBox>
      </div>

      {/* AI insights */}
      <AIBox title="🤖 AI Skill Summary" text={aiSummary} />
      <AIBox title="🎯 AI Recommendation" text={aiRecommendation} />
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="p-7 rounded-3xl bg-[rgba(10,15,35,0.55)]
      backdrop-blur-2xl border border-[#00F5FF50] shadow-xl 
      hover:scale-[1.03] transition">
      <h2 className="text-lg text-[#B8E1FF]">{title}</h2>
      <p
        className="text-4xl mt-3 font-bold"
        style={{ color: color, textShadow: `0 0 10px ${color}` }}
      >
        {value}
      </p>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="p-7 rounded-3xl bg-[rgba(10,15,35,0.55)]
      backdrop-blur-2xl border border-[#00F5FF50] shadow-xl">
      <h2 className="text-2xl text-[#B8E1FF] mb-5">{title}</h2>
      {children}
    </div>
  );
}

function AIBox({ title, text }) {
  return (
    <div className="p-8 mb-6 rounded-3xl bg-[rgba(10,15,35,0.55)]
      backdrop-blur-2xl border border-[#00F5FF50] shadow-xl">
      <h2 className="text-3xl mb-2 font-bold text-[#00F5FF] drop-shadow-[0_0_15px_#00F5FF]">
        {title}
      </h2>
      <p className="text-[#B8E1FF] text-lg">{text}</p>
    </div>
  );
}
