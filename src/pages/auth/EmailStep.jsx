import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import usePageTitle from "../../hooks/usePageTitle";
import toast from "react-hot-toast";
import pic10 from "../../assets/PIC10.jpg";

const EmailStep = () => {
  usePageTitle("Create Account - Email");

  const [formData, setFormData] = useState({
    email: "",
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const { validateEmail } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agreeToTerms) {
      toast.error("Please agree to the Terms and Conditions");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // Check if email is available (optional validation)
      const emailValidation = await validateEmail?.(formData.email);

      if (emailValidation && !emailValidation.available) {
        toast.error(
          "This email is already registered. Please use a different email or login."
        );
        setLoading(false);
        return;
      }

      // Store email in session storage for the next step
      sessionStorage.setItem("registration_email", formData.email);
      sessionStorage.setItem("registration_terms_agreed", "true");

      toast.success("Email verified! Now create your password.");
      navigate("/auth/register/password");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex animate-fade-in">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/3 relative">
        <img
          src={pic10}
          alt="Manage Assets With Ease"
          className="w-full h-screen object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-8">
          <div className="text-white">
            <h2 className="text-3xl font-bold mb-4">Manage Assets With Ease</h2>
            <p className="text-lg opacity-90">
              Never miss an important update. Stay up to date with all assets
              needs and practice effective maintenance you can be proud of.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Account
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="form-label text-gray-600 dark:text-gray-400"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                autoFocus
              />
            </div>

            <div className="flex items-start">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                required
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="w-4 h-4 mt-1 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
              />
              <label
                htmlFor="agreeToTerms"
                className="ml-3 text-sm text-gray-700 dark:text-gray-300 leading-5"
              >
                I agree to Homehub's{" "}
                <Link
                  to="/terms"
                  target="_blank"
                  className="text-secondary-600 hover:text-secondary-500 underline"
                >
                  Terms and Conditions
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  Verifying Email...
                </div>
              ) : (
                "Continue"
              )}
            </button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already a member?{" "}
              <Link
                to="/auth/login"
                className="text-secondary-600 hover:text-secondary-500 font-medium"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailStep;
