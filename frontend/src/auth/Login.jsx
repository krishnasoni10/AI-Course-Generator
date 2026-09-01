import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { handleError, handleSuccess } from "./Utils";
import { ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import ThemeToggle from "@/_components/ThemeToggle";
import robot from "../assets/robot.png";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../_context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo({ ...loginInfo, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return handleError("Email and password are required");
    }

    try {
      const result = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginInfo),
      });
      const { success, message } = result;

      if (success) {
        handleSuccess(message);
        login(result.jwtToken, result.name, result.email);
        setTimeout(() => navigate("/dashboard"), 800);
      } else {
        handleError(message || "Login failed");
      }
    } catch (err) {
      handleError(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#bfdbfe,transparent_30%),linear-gradient(135deg,#ffffff,#eef6ff_48%,#f8fafc)] px-5 py-6 text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.35),transparent_32%),linear-gradient(135deg,#020617,#0f172a_55%,#111827)] dark:text-white">
      <div className="mx-auto flex max-w-6xl justify-end">
        <ThemeToggle />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.95fr]">
        <div className="hidden lg:block">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-200">
            <Sparkles className="h-4 w-4" />
            Welcome back, learner
          </div>
          <h1 className="text-6xl font-black leading-tight">
            Continue your study quest.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            Jump back into your AI-generated courses, notes, videos, quizzes,
            and downloadable lessons.
          </p>
          <div className="relative mt-10 w-fit rounded-[2rem] border border-white bg-white/70 p-6 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-white/10">
            <img
              src={robot}
              alt="AI study assistant"
              className="h-72 w-72 object-contain"
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl border border-white bg-white/85 p-7 shadow-2xl shadow-blue-100/60 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:shadow-none sm:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-200">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-black">Welcome Back</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Log in to continue building your learning path.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={loginInfo.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-11 text-slate-950 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-400/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginInfo.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-11 pr-12 text-slate-950 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 h-12 w-full rounded-xl bg-blue-600 text-base font-bold text-white hover:bg-blue-700"
            >
              Log In
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>
            <span className="text-sm font-semibold text-slate-400">OR</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10"></div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const result = await apiFetch("/auth/google", {
                    method: "POST",
                    body: JSON.stringify({ credential: credentialResponse.credential }),
                  });
                  if (result.success) {
                    handleSuccess("Google Login successful");
                    login(result.jwtToken, result.name, result.email);
                    setTimeout(() => navigate("/dashboard"), 800);
                  } else {
                    handleError(result.message || "Google Login failed");
                  }
                } catch (err) {
                  handleError(err.message || "Something went wrong");
                }
              }}
              onError={() => {
                handleError("Google Login Failed");
              }}
              useOneTap
            />
          </div>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-600 hover:underline dark:text-blue-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Login;
