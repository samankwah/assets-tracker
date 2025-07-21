import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import EmailStep from "./EmailStep";
import PasswordStep from "./PasswordStep";

const Register = () => {
  usePageTitle('Register');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is on the base register route, redirect to email step
    if (location.pathname === '/auth/register') {
      navigate('/auth/register/email', { replace: true });
    }
  }, [location.pathname, navigate]);

  // This component now acts as a coordinator
  // The actual routing is handled in App.jsx
  // This is just a fallback redirect
  return null;
};

export default Register;
