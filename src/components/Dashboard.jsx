import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [certCount, setCertCount] = useState(0);
  const [skills, setSkills] = useState({});
  const [monthlyUploads, setMonthlyUploads] = useState([]);
  const [aiSummary, setAiSummary] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState("");
  const [shareLink, setShareLink] = useState("");

  const COLORS = ["#FFE066", "#FFD43B", "#FFEE99", "#FFF5C2", "#FFE98A"]; // 💛 yellow palette

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setShareLink(`${window.location.origin}/public-dashboard/${user.id}`);

    const { data: certs } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id);

    if (!certs) return;

    setCertCount(certs.length);

    const skillMap = {};
    certs.forEach((c) => {
      (c.skills?.split(",") || []).forEach((s) => {
        const skill = s.trim();
        if (skill) skillMap[skill] = (skillMap[skill] || 0) + 1;
      });
    });
    setSkills(skillMap);

    const monthly = {};
    certs.forEach((c) => {
      const m = new Date(c.created_at).toLocaleString("default", {
        month: "short",
      });
      monthly[m] = (monthly[m] || 0) + 1;
    });

    setMonthlyUploads(
      Object.entries(monthly).map(([month, count]) => ({
        month,
        count,
      }))
    );

    generateAISummary(skillMap);
    generateAIRecommendation(skillMap);
  }

  function generateAISummary(skillMap) {
    if (!Object.keys(skillMap).length) {
      setAiSummary("Upload a certificate to generate your personalized AI breakdown.");
      return;
    }

    const strongest = Object.entries(skillMap).sort((a, b) => b[1] - a[1])[0];
    setAiSummary(
      `Your strongest verified skill is **${strongest[0]}**, based on consistent certifications.`
    );
  }

  function generateAIRecommendation(skillMap) {
    const s = Object.keys(skillMap).map((x) => x.toLowerCase());
    if (s.includes("aws") || s.includes("cloud")) {
      setAiRecommendation("Next Recommended: AWS Solutions Architect Associate 🌩️");
      return;
    }
    if (s.includes("python") || s.includes("ml")) {
      setAiRecommendation("Next Recommended: TensorFlow Developer Certification 🤖");
      return;
    }
    setAiRecommendation("You can explore Cloud, DevOps, or Data Engineering 🚀");
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    alert("✅ Dashboard link copied!");
  };

  return (
    <div className="min-h-screen px-6 py-10">

      {/* TITLE + SHARE BUTTON */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-10">
        <h1
          className="text-5xl font-extrabold text-transparent bg-clip-text
           bg-gradient-to-r from-[#FFE066] to-[#FFD43B]
           drop-shadow-[0_0_20px_#FFE066]"
        >
          ⚡ Dashboard — Defines Your Capabilites
        </h1>

        <button
          onClick={handleCopy}
          className="mt-5 lg:mt-0 bg-gradient-to-r 
          from-[#FFE066] to-[#FFD43B] text-black font-semibold px-6 py-2 
          rounded-full shadow-[0_0_15px_#FFE066] hover:scale-[1.05] 
          transition-all duration-300"
        >
          🔗 Share My Dashboard
        </button>
      </div>

      {/* GRID CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
        <Card title="Total Certificates" value={certCount} color="#FFE066" />
        <Card title="Unique Skills" value={Object.keys(skills).length} color="#FFD43B" />
        <Card
          title="Strongest Skill"
          value={
            Object.keys(skills).length
              ? Object.entries(skills).sort((a, b) => b[1] - a[1])[0][0]
              : "N/A"
          }
          color="#FFF5C2"
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        <ChartCard title="📈 Monthly Upload Trend">
          <LineChart width={350} height={250} data={monthlyUploads}>
            <CartesianGrid stroke="rgba(255,255,200,0.2)" />
            <XAxis stroke="#FFF5C2" dataKey="month" />
            <YAxis stroke="#FFF5C2" />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#FFE066" strokeWidth={3} />
          </LineChart>
        </ChartCard>

        <ChartCard title="🔮 Skill Distribution">
          <PieChart width={350} height={250}>
            <Pie
              data={Object.entries(skills).map(([name, value]) => ({
                name,
                value,
              }))}
              cx={170}
              cy={120}
              outerRadius={90}
              label
            >
              {Object.entries(skills).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartCard>
      </div>

      {/* AI Sections */}
      <AIBlock title="🤖 AI Skill Summary" text={aiSummary} />
      <AIBlock title="🎯 AI Recommendation" text={aiRecommendation} />
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div
      className="p-7 rounded-3xl bg-[rgba(10,15,35,0.55)]
      backdrop-blur-2xl border border-[#FFE06650] shadow-xl 
      hover:scale-[1.03] transition"
    >
      <h2 className="text-lg" style={{ color: "#FFF5C2" }}>{title}</h2>
      <p
        className="text-4xl mt-3 font-bold"
        style={{ color, textShadow: `0 0 15px ${color}` }}
      >
        {value}
      </p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div
      className="p-7 rounded-3xl bg-[rgba(10,15,35,0.55)]
      backdrop-blur-2xl border border-[#FFE06650] shadow-xl"
    >
      <h2
        className="text-2xl mb-5 font-bold"
        style={{ color: "#FFF5C2",}}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function AIBlock({ title, text }) {
  return (
    <div
      className="p-8 mb-6 rounded-3xl bg-[rgba(10,15,35,0.55)]
      backdrop-blur-2xl border border-[#FFE06650] shadow-xl"
    >
      <h2
        className="text-3xl mb-2 font-bold"
        style={{ color: "#dfb616ff" }}
      >
        {title}
      </h2>
      <p className="text-[#FFF5C2] text-lg">{text}</p>
    </div>
  );
}
