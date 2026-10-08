import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import API from "../../api/axios";

const Login = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const handleLogin = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      const response = await API.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      console.log(response.data);

      // token = response.data.token;

      const role = response.data.role;

      // Inside your login success block:
localStorage.setItem("token", response.data.token);
localStorage.setItem("role", response.data.role);
localStorage.setItem("name", response.data.name); // ADD THIS LINE

      alert("Login Success");

      // ROLE REDIRECT

      if (role === "ADMIN") {

        navigate("/admin");

      }

      else if (role === "RETAILER") {

        navigate("/retailer");

      }

      else if (role === "DISTRIBUTOR") {

        navigate("/distributor");

      }

    } catch (error) {

      console.log(error);

      alert("Invalid Credentials");

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-[400px]">

        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          PharmaNex ERP
        </h1>

        <h2 className="text-xl font-semibold mb-5 text-center">
          Login
        </h2>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          <div>

            <label className="block mb-1">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full border p-3 rounded-lg"
            />

          </div>

          <div>

            <label className="block mb-1">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border p-3 rounded-lg"
            />

          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Login
          </button>

        </form>

        <p className="text-center mt-5">

          Don't have account?{" "}

          <Link
            to="/register"
            className="text-blue-600"
          >
            Register
          </Link>

        </p>

      </div>

    </div>

  );
};

export default Login;