"use client";

import type React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signUpSchema } from "@/schemas/auth.schema";
import Link from "next/link";
import Image from "next/image";
import { useContext, useState } from "react";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import { registerUser } from "@/api/authentication";
import { SessionContext } from "@/context/SessionContext";
import {
  Eye,
  EyeOff,
  Leaf,
  ArrowRight,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { GoogleSigninButton } from "../signin/google-oauth";

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const router = useRouter();
  const session = useContext(SessionContext);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  // Calculate password strength based on several criteria
  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 25;
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 25;
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 25;
    // Contains number or special char
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;
    return strength;
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStrength = calculatePasswordStrength(e.target.value);
    setPasswordStrength(newStrength);
  };

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    setServerError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const data = await registerUser(values.email, values.password);

      if (!data) {
        setServerError(
          "An error occurred while registering. Please try again."
        );
        throw new Error("No data received from the server.");
      }

      session!.setToken(data.token);
      session!.setUser(values.email);
      setSuccessMessage("Registration successful! You can now sign in.");
      router.push("/setup");
    } catch (error: any) {
      console.error("Error during registration:", error);
      setServerError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-yellow-500";
    if (passwordStrength <= 75) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 dark:from-gray-900 to-white dark:to-gray-800">
      <div className="grid lg:grid-cols-[1fr_1.2fr] h-screen overflow-hidden">
        {/* Left Side - Image */}
        <div className="hidden lg:block relative">
          <div className="absolute inset-0 bg-[url('/plant-background.jpeg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 to-green-800/40 flex flex-col justify-between p-10">
              <div>
                <Link href="/" className="flex items-center gap-2 text-white">
                  <Leaf className="h-6 w-6" />
                  <span className="font-bold text-xl">ForFarm</span>
                </Link>
              </div>
              <div className="max-w-md">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Join the farming revolution
                </h2>
                <p className="text-green-100 mb-6">
                  Create your account today and discover how ForFarm can help
                  you optimize your agricultural operations.
                </p>
                <div className="space-y-4">
                  {[
                    "Real-time monitoring of your crops",
                    "Smart resource management",
                    "Data-driven insights for better yields",
                    "Connect with other farmers in your area",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="rounded-full bg-green-500 p-1 mt-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-green-100 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex justify-center items-center p-6">
          <div className="w-full max-w-md">
            {/* Theme Selector Placeholder */}
            <div className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Theme Selector Placeholder
            </div>

            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/forfarm-logo.png"
                  alt="Forfarm"
                  width={80}
                  height={80}
                />
              </Link>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create your account</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {serverError && (
              <Alert variant="destructive" className="mb-6 animate-fadeIn">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="mb-6 bg-green-50 text-green-800 border-green-200 animate-fadeIn">
                <Check className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium dark:text-gray-300"
                >
                  Email
                </Label>
                <div className="relative">
                  <Input
                    type="email"
                    id="email"
                    placeholder="name@example.com"
                    className={`h-12 px-4 ${
                      errors.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium dark:text-gray-300"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    className={`h-12 px-4 ${
                      errors.password
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    {...register("password", { onChange: onPasswordChange })}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Password strength
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          passwordStrength <= 25
                            ? "text-red-500"
                            : passwordStrength <= 50
                            ? "text-yellow-500"
                            : passwordStrength <= 75
                            ? "text-blue-500"
                            : "text-green-500"
                        }`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <Progress
                      value={passwordStrength}
                      className={`${getPasswordStrengthColor()} h-1`}
                    />
                  </div>
                )}

                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium dark:text-gray-300"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="••••••••"
                    className={`h-12 px-4 ${
                      errors.confirmPassword
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-full font-medium text-base bg-green-600 hover:bg-green-700 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-500">
                    Or sign up with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleSigninButton />
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
              By signing up, you agree to our{" "}
              <Link
                href="/terms"
                className="text-green-600 hover:text-green-700"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-green-600 hover:text-green-700"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
