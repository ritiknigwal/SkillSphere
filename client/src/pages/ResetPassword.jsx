import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { toast } from "react-toastify";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    try {
      await API.post("/password-reset/reset", form);

      toast.success("Password reset successfully. Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">
            Reset Password
          </h1>

          <p className="text-slate-400 mt-2">
            Enter the OTP and create your new password.
          </p>
        </div>

        <form onSubmit={resetPassword} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              OTP
            </label>

            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit OTP"
              value={form.otp}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              New Password
            </label>

            <input
              type="password"
              name="newPassword"
              placeholder="Create a new password"
              value={form.newPassword}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold transition"
          >
            Reset Password
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6">
          Back to{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;