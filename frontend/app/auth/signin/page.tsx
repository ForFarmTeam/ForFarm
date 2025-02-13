"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { signInSchema } from "@/schema/authSchema";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import ForgotPasswordModal from "./forgot-password-modal";

import Link from "next/link";
import Image from "next/image";
import { GoogleSigninButton } from "./google-oauth";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninPage() {
  const [serverError, setServerError] = useState(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    setServerError(null); // reset previous errors
    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: values.email,
          Password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in.");
      }

      localStorage.setItem("token", data.Token);
      localStorage.setItem("user", values.email);

      router.push("/setup");
    } catch (error) {
      console.error("Error logging in:", error);
      setServerError(error.message);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-[0.7fr_1.2fr] h-screen overflow-hidden">
        <div className="flex bg-[url('/plant-background.jpeg')] bg-cover bg-center"></div>

        <div className="flex justify-center items-center">
          <div className="container px-[25%]">
            <div className="flex flex-col justify-center items-center">
              <span>
                <Image src="/forfarm-logo.png" alt="Forfarm" width={150} height={150} />
              </span>
              <h1 className="text-3xl font-semibold">Welcome back.</h1>
              <div className="flex whitespace-nowrap gap-x-2 mt-2">
                <span className="text-md">New to Forfarm?</span>
                <span className="text-green-600">
                  <Link href="signup" className="underline">
                    Sign up
                  </Link>
                </span>
              </div>
            </div>

            {/* Sign in form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mt-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="Email" {...register("email")} />
                {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
              </div>
              <div className="mt-5">
                <Label htmlFor="password">Password</Label>
                <Input type="password" id="password" placeholder="Password" {...register("password")} />
                {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="mt-5 rounded-full">
                Log in
              </Button>
            </form>

            <div id="signin-footer" className="flex justify-between mt-5">
              <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <label htmlFor="terms" className="text-sm font-medium leading-none">
                  Remember me
                </label>
              </div>
              <ForgotPasswordModal />
            </div>

            <div className="my-5">
              <p className="text-sm">Or log in with</p>
              <div className="flex flex-col gap-x-5 mt-3">
                <GoogleSigninButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
