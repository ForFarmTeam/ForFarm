"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signInSchema } from "@/schemas/auth.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import ForgotPasswordModal from "./forgot-password-modal";
import Link from "next/link";
import Image from "next/image";
import { GoogleSigninButton } from "./google-oauth";
import type { z } from "zod";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/api/authentication";
import { SessionContext } from "@/context/SessionContext";
import { Eye, EyeOff, Leaf, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SigninPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const session = useContext(SessionContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const data = await loginUser(values.email, values.password);

      if (!data) {
        setServerError("An error occurred while logging in. Please try again.");
        throw new Error("No data received from the server.");
      }
      session!.setToken(data.token);
      session!.setUser(values.email);

      router.push("/setup");
    } catch (error: any) {
      console.error("Error logging in:", error);
      setServerError(error.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 dark:from-gray-900 to-white dark:to-gray-800">
      <div className="grid lg:grid-cols-[1fr_1.2fr] h-screen overflow-hidden">
        {/* Left side - Image */}
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
                <h2 className="text-3xl font-bold text-white mb-4">Grow smarter with ForFarm</h2>
                <p className="text-green-100 mb-6">
                  Join thousands of farmers using our platform to optimize their agricultural operations and increase
                  yields.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-green-600 overflow-hidden">
                        <Image
                          src={`/placeholder.svg?height=32&width=32`}
                          alt="User"
                          width={32}
                          height={32}
                          className="bg-green-200"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-green-100">
                    <span className="font-bold">500+</span> farmers already using ForFarm
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex justify-center items-center p-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/forfarm-logo.png" alt="Forfarm" width={80} height={80} />
              </Link>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
              <p className="text-gray-500 dark:text-gray-400">
                New to Forfarm?{" "}
                <Link href="/auth/signup" className="text-green-600 hover:text-green-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>

            {serverError && (
              <Alert variant="destructive" className="mb-6 animate-fadeIn">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            {/* Sign in form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium dark:text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    type="email"
                    id="email"
                    placeholder="name@example.com"
                    className={`h-12 px-4 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password" className="text-sm font-medium dark:text-gray-300">
                    Password
                  </Label>
                  <ForgotPasswordModal />
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    className={`h-12 px-4 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-full font-medium text-base bg-green-600 hover:bg-green-700 transition-all"
                disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Log in
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
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleSigninButton />
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-green-600 hover:text-green-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-green-600 hover:text-green-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
