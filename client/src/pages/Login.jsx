import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data._id);
      localStorage.setItem("fullName", res.data.fullName);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("role", res.data.role);

      toast.success("Login successful");

      navigate("/dashboard");
    } catch (err) {
      if (
        err.response?.status === 403 &&
        err.response?.data?.isVerified === false
      ) {
        toast.info("Please verify your email first.");

        navigate("/verify-email", {
          state: {
            email: err.response.data.email,
          },
        });

        return;
      }

      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    // <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
         <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 flex items-center justify-center px-4"> 
         <div className="w-full max-w-md bg-neutral-800 border border-neutral-1000 rounded-2xl p-8 shadow-5xl">
         <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-500">SkillSphere </h1>
          <p className="text-slate-50 mt-2">
            Login to continue your learning network
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-50 mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-warm-800 border border-slate-700 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-50 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
              required
              // className="w-full p-3 rounded-xl bg-warm-800 border border-slate-700 text-white outline-none focus:border-blue-500"
              className="w-full p-3 rounded-xl bg-white border border-sky-500 text-slate-900 placeholder:text-slate-400 caret-sky-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-sky"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-sky-700 hover:bg-blue-900 py-3 rounded-xl text-slate-50 font-semibold transition"
          >
            Login
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link to="/forgot-password" className="text-sky-400 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <p className="text-center text-slate-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-sky-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;