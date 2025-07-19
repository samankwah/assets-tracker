import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ForgotPassword = () => {
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
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Verify & Reset Password
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            A reset link has been sent to your email address
          </p>
        </div>

        <div className="space-y-6">
          {/* <button
            onClick={handleResend}
            disabled={loading}
            className="w-full btn-primary"
          >
            {loading ? <div className="spinner"></div> : 'Skip Now'}
          </button> */}

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Didn't receive an email?{" "}
            <button
              onClick={handleResend}
              className="text-secondary-600 hover:text-secondary-500"
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Forgot Password?
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
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

        <button type="submit" disabled={loading} className="w-full btn-primary">
          {loading ? <div className="spinner"></div> : "Submit"}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Remember your password?{" "}
          <Link
            to="/auth/login"
            className="text-secondary-600 hover:text-secondary-500"
          >
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
