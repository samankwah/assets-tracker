import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import usePageTitle from "../../hooks/usePageTitle";
import toast from "react-hot-toast";
import pic11 from "../../assets/pic 11.avif";

const ForgotPassword = () => {
  usePageTitle('Forgot Password');
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setEmailSent(true);
        toast.success("Password reset link sent to your email");
      } else {
        toast.error(result.error || "Failed to send reset link");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        toast.success("Password reset link sent again");
      } else {
        toast.error(result.error || "Failed to send reset link");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${pic11})`
          }}
        >
          {/* Optional overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>

        {/* White card container */}
        <div className="relative z-10 bg-white rounded-lg p-10 w-full max-w-lg mx-4 shadow-2xl animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verify & Reset Password
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              A reset link has been sent to your email address
            </p>
          </div>

          <div className="space-y-6">
            <p className="text-center text-sm text-gray-600">
              Didn't receive an email?{" "}
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-secondary-600 hover:text-secondary-700 font-medium"
              >
                {loading ? "Sending..." : "Resend"}
              </button>
            </p>
            
            <Link
              to="/auth/login"
              className="block text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${pic11})`
        }}
      >
        {/* Optional overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* White card container */}
      <div className="relative z-10 bg-white rounded-lg p-10 w-full max-w-lg mx-4 shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Forgot Password?
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Kindly enter the email address associated with your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ginny@gmail.com"
              className="form-input"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full btn-primary"
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              "Submit"
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link
              to="/auth/login"
              className="text-secondary-600 hover:text-secondary-700 font-medium"
            >
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
