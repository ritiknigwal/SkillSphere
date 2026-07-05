import { useEffect, useState } from "react";
import API from "../api/axios";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://skillsphere-1k44.onrender.com";

const getFileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

function Profile() {
  const [user, setUser] = useState({
    fullName: "",
    headline: "",
    bio: "",
    location: "",
    profileImage: "",
    resume: "",
    rating: 0,
    totalReviews: 0,
    github: "",
    linkedin: "",
    portfolio: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [reviews, setReviews] = useState([]);

  const userId = localStorage.getItem("userId");

  const fetchProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      setUser(res.data.user);
    } catch (error) {
      alert("Failed to load profile");
    }
  };

  const fetchReviews = async () => {
    try {
      if (!userId) return;
      const res = await API.get(`/reviews/user/${userId}`);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.log("Failed to load reviews", error);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchReviews();
  }, []);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await API.put("/user/profile", user);
      alert("Profile updated successfully");
      fetchProfile();
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return alert("Select image first");

    try {
      const formData = new FormData();
      formData.append("profilePhoto", selectedFile);

      await API.post("/user/profile-photo", formData);

      alert("Profile photo uploaded");
      fetchProfile();
    } catch (error) {
      alert("Failed to upload photo");
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return alert("Select PDF first");

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      await API.post("/user/upload-resume", formData);

      alert("Resume uploaded successfully");
      fetchProfile();
    } catch (error) {
      alert("Failed to upload resume");
    }
  };

  const renderStars = (rating) => {
    const value = Math.round(Number(rating) || 0);

    return "★★★★★".split("").map((star, index) => (
      <span
        key={index}
        className={index < value ? "text-yellow-400" : "text-gray-500"}
      >
        {star}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl">
          <h1 className="text-4xl font-bold">My Profile</h1>
          <p className="text-blue-100 mt-2">
            Manage your personal details, resume, portfolio links and reviews.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl">
            <p className="text-gray-400 text-sm">Average Rating</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">
              ⭐ {user.rating || 0}
            </p>
            <div className="text-lg mt-1">{renderStars(user.rating)}</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl">
            <p className="text-gray-400 text-sm">Total Reviews</p>
            <p className="text-3xl font-bold mt-1">
              {user.totalReviews || 0}
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl">
            <p className="text-gray-400 text-sm">Badge</p>
            <p className="text-xl font-bold mt-2">
              {Number(user.rating) >= 4.5 && Number(user.totalReviews) >= 3
                ? "🏅 Top Rated"
                : "⭐ SkillSphere Member"}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h2 className="text-xl font-bold mb-4">Profile Photo</h2>

              <div className="flex flex-col items-center">
                <img
                  src={
                    user.profileImage
                      ? getFileUrl(user.profileImage)
                      : `https://ui-avatars.com/api/?name=${user.fullName || "User"}`
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-slate-600"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="text-sm text-slate-300"
                />

                <button
                  type="button"
                  onClick={handlePhotoUpload}
                  className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl mt-4"
                >
                  Upload Photo
                </button>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <h2 className="text-xl font-bold mb-4">Resume</h2>

              {user.resume && (
                <a
                  href={getFileUrl(user.resume)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-blue-400 underline mb-4"
                >
                  View Current Resume
                </a>
              )}

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="text-sm text-slate-300"
              />

              <button
                type="button"
                onClick={handleResumeUpload}
                className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-xl mt-4"
              >
                Upload Resume
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-5">Profile Information</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={user.fullName || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:border-blue-500"
              />

              <input
                type="text"
                name="headline"
                placeholder="Headline"
                value={user.headline || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:border-blue-500"
              />

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={user.location || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:border-blue-500"
              />

              <textarea
                name="bio"
                placeholder="Bio"
                rows="4"
                value={user.bio || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:border-blue-500"
              />

              <div className="border-t border-slate-700 pt-5">
                <h2 className="text-xl font-bold mb-3">Portfolio Links</h2>

                <input
                  type="url"
                  name="github"
                  placeholder="GitHub Profile URL"
                  value={user.github || ""}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 mb-3 outline-none focus:border-blue-500"
                />

                <input
                  type="url"
                  name="linkedin"
                  placeholder="LinkedIn Profile URL"
                  value={user.linkedin || ""}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 mb-3 outline-none focus:border-blue-500"
                />

                <input
                  type="url"
                  name="portfolio"
                  placeholder="Portfolio Website URL"
                  value={user.portfolio || ""}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold"
              >
                Save Profile
              </button>
            </form>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Reviews Received</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-700 rounded-2xl">
              <p className="text-gray-400">No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review) => (
                <div
                  key={review._id}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-700"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        {review.reviewer?.fullName || "User"}
                      </p>

                      <p className="text-yellow-400">
                        {renderStars(review.rating)}
                      </p>
                    </div>

                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {review.comment && (
                    <p className="text-gray-300 mt-2">"{review.comment}"</p>
                  )}

                  {review.exchange && (
                    <p className="text-xs text-gray-400 mt-2">
                      Exchange: {review.exchange.offeredSkill} ↔{" "}
                      {review.exchange.wantedSkill}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;