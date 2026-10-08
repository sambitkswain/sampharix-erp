import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "DISTRIBUTOR", // Default role
  });

  const validateForm = () => {
    // 1. Check Phone Number (Ensure it's exactly 10 digits - adjust if needed for your country)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return false;
    }

    // 2. Check Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // 3. Check Password Length
    if (formData.password.length < 5) {
      setError("Password must be at least 5 characters long.");
      return false;
    }

    return true; // Form is perfect
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Run the frontend validation shield first
    if (!validateForm()) return; 

    try {
      await API.post("/auth/register", formData);
      alert("Registration successful! Please wait for Admin approval.");
      navigate("/login");
    } catch (err: any) {
      // Capture the error sent from Spring Boot
      const errorMessage = err.response?.data?.message || err.response?.data || "Registration failed. Please try again.";
      setError(typeof errorMessage === 'string' ? errorMessage : "An error occurred");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Create Account</h2>
        <p className="text-center text-slate-500 mb-6">Join the PharmaNex Network</p>

        {/* Error Message Box */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Business Name <span className="text-red-500">*</span></label>
            <input required type="text" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Email Address <span className="text-red-500">*</span></label>
            <input required type="email" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Mobile Number <span className="text-red-500">*</span></label>
            <input required type="tel" maxLength={10} placeholder="10-digit mobile number" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Password <span className="text-red-500">*</span></label>
            <input required type="password" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Role <span className="text-red-500">*</span></label>
            <select className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="RETAILER">Retailer</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors mt-4">
            Register Account
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;