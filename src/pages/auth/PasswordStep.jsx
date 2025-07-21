import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import usePageTitle from "../../hooks/usePageTitle";
import { Eye, EyeOff, Check, X, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import pic9 from "../../assets/pic 9.avif";

const PasswordStep = () => {
  usePageTitle("Create Account - Password");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength validation
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem("registration_email");
    const termsAgreed = sessionStorage.getItem("registration_terms_agreed");

    if (!storedEmail || !termsAgreed) {
      toast.error("Please start from the beginning");
      navigate("/auth/register");
      return;
    }

    setEmail(storedEmail);
  }, [navigate]);

  useEffect(() => {
    // Validate password strength
    const password = formData.password;
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check password strength
    const isPasswordStrong = Object.values(passwordValidation).every(Boolean);
    if (!isPasswordStrong) {
      toast.error("Please ensure your password meets all requirements");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const result = await register(email, formData.password);
      if (result.success) {
        // Clear session storage
        sessionStorage.removeItem("registration_email");
        sessionStorage.removeItem("registration_terms_agreed");

        toast.success(
          "Account created successfully! Welcome to Asset Tracker!"
        );
        navigate("/");
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/auth/register/email");
  };

  const getPasswordStrengthColor = () => {
    const validCount = Object.values(passwordValidation).filter(Boolean).length;
    if (validCount < 2) return "bg-red-500";
    if (validCount < 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    const validCount = Object.values(passwordValidation).filter(Boolean).length;
    if (validCount < 2) return "Weak";
    if (validCount < 4) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen flex animate-fade-in">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/3 relative">
        <img
          src={pic9}
          alt="Create Your Password"
          className="w-full h-screen object-cover"
        />
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md relative">
          <button
            onClick={handleBack}
            className="absolute -top-12 left-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 z-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Your Password
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Choose your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="form-label text-gray-600 dark:text-gray-400"
              >
                Type Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="form-label text-gray-600 dark:text-gray-400"
              >
                Repeat Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input pr-10 ${
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password requirement tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  One Uppercase
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  One Special Character
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  One Number
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  One Lower
                </span>
                <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  Minimum 8 character
                </span>
              </div>

              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <X className="w-3 h-3" />
                    <span>Passwords do not match</span>
                  </p>
                )}
              {formData.confirmPassword &&
                formData.password === formData.confirmPassword && (
                  <p className="mt-1 text-sm text-green-600 flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Passwords match</span>
                  </p>
                )}
            </div>

            {/* Terms and Privacy */}
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              By creating an account, you agree to our{" "}
              <Link
                to="/terms"
                target="_blank"
                className="text-gray-900 dark:text-white font-medium underline"
              >
                Terms of Service
              </Link>{" "}
              and have read and understood the{" "}
              <Link
                to="/privacy"
                target="_blank"
                className="text-gray-900 dark:text-white font-medium underline"
              >
                Privacy Policy
              </Link>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !Object.values(passwordValidation).every(Boolean) ||
                formData.password !== formData.confirmPassword
              }
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Login Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordStep;
