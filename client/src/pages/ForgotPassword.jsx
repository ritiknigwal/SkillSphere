import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const sendOTP = async (e) => {
    e.preventDefault();

    try {
      await API.post("/password-reset/send-otp", { email });

      alert("Password reset OTP sent to your email");

      navigate("/reset-password", {
        state: {
          email,
        },
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">
            Forgot Password
          </h1>

          <p className="text-slate-400 mt-2">
            Enter your registered email to receive a password reset OTP.
          </p>
        </div>

        <form onSubmit={sendOTP} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold transition"
          >
            Send OTP
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6">
          Remember your password?{" "}
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

export default ForgotPassword;