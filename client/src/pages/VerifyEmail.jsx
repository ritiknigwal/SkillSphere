import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");

  const verifyOTP = async (e) => {
    e.preventDefault();

    try {
      await API.post("/email-verification/verify-otp", {
        email,
        otp,
      });

      alert("Email verified successfully. Please login now.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    }
  };

  const resendOTP = async () => {
    try {
      await API.post("/email-verification/send-otp", {
        email,
      });

      alert("OTP sent again to your email");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Verify Email</h1>
          <p className="text-slate-400 mt-2">
            Enter the OTP sent to your registered email
          </p>
        </div>

        <form onSubmit={verifyOTP} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">
              6 Digit OTP
            </label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-semibold transition"
          >
            Verify Email
          </button>
        </form>

        <button
          onClick={resendOTP}
          className="w-full mt-4 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-white font-semibold transition"
        >
          Resend OTP
        </button>

        <p className="text-center text-slate-400 mt-6">
          Already verified?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;