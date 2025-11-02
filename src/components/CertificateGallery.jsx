import { useEffect, useState, useRef } from "react";
import { supabase } from "../utils/supabaseClient";

export default function CertificateGallery() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState({});
  const [formValues, setFormValues] = useState({});
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User not logged in");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching certificates:", error);
    } else {
      setCertificates(data);
      const initialFormState = {};
      data.forEach((cert) => {
        initialFormState[cert.id] = {
          title: cert.title,
          company: cert.company,
          skills: cert.skills,
        };
      });
      setFormValues(initialFormState);
    }
    setLoading(false);
  };

  const handleDelete = async (id, fileUrl) => {
    const filePath = fileUrl.split("/certificates/")[1];

    const { error: storageError } = await supabase.storage
      .from("certificates")
      .remove([filePath]);

    if (storageError) {
      console.error("Error deleting file:", storageError);
      alert("Failed to delete file.");
      return;
    }

    const { error: dbError } = await supabase
      .from("certificates")
      .delete()
      .eq("id", id);

    if (dbError) {
      console.error("Error deleting record:", dbError);
      alert("Failed to delete record.");
      return;
    }

    setCertificates((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleEdit = (id) => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (id, field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSave = async (id) => {
    const { title, company, skills } = formValues[id];

    const { error } = await supabase
      .from("certificates")
      .update({ title, company, skills })
      .eq("id", id);

    if (error) {
      console.error("Update error:", error);
      alert("Failed to update certificate");
      return;
    }

    setEditMode((prev) => ({ ...prev, [id]: false }));
    fetchCertificates();
  };

  // const getPublicUrl = (filePath) => {
  //   const parts = filePath.split("/certificates/");
  //   return `https://gclzcyunkashfnwgzxwf.supabase.co/storage/v1/object/public/certificates/${parts[1]}`;
  // };
const getPublicUrl = (filePath) => {
  // file_url is already a full public link, so just return it directly
  return filePath;
};

  return (
   <div
  ref={vantaRef}
  className="fixed top-5 left-0 w-full h-screen overflow-hidden px-6 py-12 text-white z-0"
>
  <h2 className="text-3xl font-bold text-center mb-10 text-pink-400">
    📁 Certificate Gallery
  </h2>

  {loading ? (
    <p className="text-center">Loading...</p>
  ) : certificates.length === 0 ? (
    <p className="text-center">No certificates uploaded yet.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-hidden">
      {certificates.slice(0, 3).map((cert) => (
        <div
          key={cert.id}
          className="bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-xl rounded-2xl p-5 transition-transform hover:scale-[1.02]"
        >
          {editMode[cert.id] ? (
            <>
              <input
                type="text"
                value={formValues[cert.id]?.title || ""}
                onChange={(e) => handleChange(cert.id, "title", e.target.value)}
                className="bg-transparent text-xl font-semibold mb-2 w-full border-b border-white/30 focus:outline-none"
              />
              <input
                type="text"
                value={formValues[cert.id]?.company || ""}
                onChange={(e) => handleChange(cert.id, "company", e.target.value)}
                className="bg-transparent text-sm mb-1 w-full border-b border-white/20 focus:outline-none"
              />
              <input
                type="text"
                value={formValues[cert.id]?.skills || ""}
                onChange={(e) => handleChange(cert.id, "skills", e.target.value)}
                className="bg-transparent text-sm w-full border-b border-white/20 focus:outline-none"
              />
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold">{cert.title}</h3>
              <p className="text-sm mt-1">🏢 {cert.company}</p>
              <p className="text-sm mt-1">💡 Skills: {cert.skills}</p>
            </>
          )}

          <div className="mt-4 flex flex-wrap gap-2 justify-between items-center">
            <a
              href={getPublicUrl(cert.file_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm"
            >
              🔗 View
            </a>
            {editMode[cert.id] ? (
              <button
                onClick={() => handleSave(cert.id)}
                className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-sm"
              >
                ✅ Save
              </button>
            ) : (
              <button
                onClick={() => toggleEdit(cert.id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm"
              >
                ✏️ Modify
              </button>
            )}
            <button
              onClick={() => handleDelete(cert.id, cert.file_url)}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
            >
              🗑 Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

  );
}
