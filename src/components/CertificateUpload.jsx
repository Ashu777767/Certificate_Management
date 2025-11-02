import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { AnimatedBackground } from "animated-backgrounds";

export default function CertificateUpload() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [skills, setSkills] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");
    setUploading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      alert("You must be logged in to upload certificates.");
      setUploading(false);
      return;
    }

    const user = session.user;
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`; // Storing under user ID folder

    // Upload file to Supabase Storage
    const { data: fileData, error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      alert("Upload failed");
      setUploading(false);
      return;
    }

    // Get public URL of uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("certificates")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;

    if (!publicUrl) {
      alert("Failed to get public URL.");
      setUploading(false);
      return;
    }

    // Insert metadata into "certificates" table
    const { error: insertError } = await supabase.from("certificates").insert({
      user_id: user.id,
      title,
      company,
      skills,
      file_url: publicUrl,
    });

    if (insertError) {
      console.error("Insert Error:", insertError);
      alert("Error saving to database");
    } else {
      alert("✅ Certificate uploaded!");
      setTitle("");
      setCompany("");
      setSkills("");
      setFile(null);
    }

    setUploading(false);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden">
      <AnimatedBackground
        animationName="floatingBubbles"
        theme="presentation"
        interactive={false}
        adaptivePerformance={true}
        className="absolute inset-0 -z-10"
      />

      <div className="relative z-10 max-w-xl w-full p-8 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30">
        <h2 className="text-3xl font-extrabold text-white text-center mb-6">
          📄 Upload Your Certificate
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="e.g. AWS Cloud Practitioner"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Company
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="e.g. Amazon Web Services"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Skills
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
              placeholder="e.g. Cloud, AWS, Networking"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-1">
              Upload File
            </label>
            <label className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer">
              <span>📁 Choose File</span>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </label>
            {file && (
              <p className="text-sm text-white mt-1">Selected: {file.name}</p>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full py-2 px-4 text-white font-semibold rounded-lg transition-all shadow-lg backdrop-blur-md ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {uploading ? "Uploading..." : "🚀 Upload Certificate"}
          </button>
        </div>
      </div>
    </div>
  );
}
