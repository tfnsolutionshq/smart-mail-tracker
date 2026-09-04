import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useNotification } from "../../context/NotificationContext";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import authImage from "../../assets/Authentication/Auth.jpg";
import logo from "../../assets/SMTLogowhite.png";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmail(location.state?.email || "");
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      showNotification("Please enter the 6-digit OTP", "error");
      return;
    }

    if (!password) {
      showNotification("Please enter a new password", "error");
      return;
    }

    if (password !== passwordConfirmation) {
      showNotification("Passwords do not match", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://identity.smt.tfnsolutions.us/api/v1/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp,
            password,
            password_confirmation: passwordConfirmation,
          }),
        },
      );

      const data = await response.json();

      if (data.status) {
        showNotification(data.message, "success");
        navigate("/login");
      } else {
        showNotification(
          data.message || "Password reset failed. Please try again.",
          "error",
        );
      }
    } catch {
      showNotification("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(1, 24, 35, 0.98), rgba(1, 24, 35, 0.95)), url(${authImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-6">
          <Link to="/">
            <img
              src={logo}
              alt="SmartMailTrack"
              className="h-14 mx-auto mb-3"
            />
          </Link>
          <p className="text-xs text-gray-300">
            Enterprise Memo Management Platform
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
            Reset Password
          </h2>
          <p className="text-center text-gray-600 text-xs mb-4">
            Enter the OTP sent to <span className="font-semibold">{email}</span>{" "}
            and create a new password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                OTP
              </label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtp(val);
                }}
                placeholder="Enter 6-digit OTP"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordConfirmation(!showPasswordConfirmation)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswordConfirmation ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors duration-200 mt-4 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Resetting...
                </>
              ) : (
                <>
                  <FiArrowRight className="w-4 h-4" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">POWERED BY TFN SOLUTIONS</p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
