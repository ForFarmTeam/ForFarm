"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { signUpSchema } from "@/schema/authSchema";

import Link from "next/link";
import Image from "next/image";
import { useContext, useState } from "react";
import { z } from "zod";

import { useRouter } from "next/navigation";

import { registerUser } from "@/api/authentication";
import { SessionContext } from "@/context/SessionContext";

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const session = useContext(SessionContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signUpSchema>) => {
    setServerError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const data = await registerUser(values.email, values.password);

      if (!data) {
        setServerError("An error occurred while registering. Please try again.");
        throw new Error("No data received from the server.");
      }
      session!.setToken(data.token);
      session!.setUser(values.email);

      setSuccessMessage("Registration successful! You can now sign in.");
      router.push("/setup");
    } catch (error: any) {
      console.error("Error during registration:", error);
      setServerError(error.message);
    } finally {
      setIsLoading(false);
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
              <h1 className="text-3xl font-semibold">Hi! Welcome</h1>
              <div className="flex whitespace-nowrap gap-x-2 mt-2">
                <span className="text-md">Already have an account?</span>
                <span className="text-green-600">
                  <Link href="/auth/signin" className="underline">
                    Sign in
                  </Link>
                </span>
              </div>
            </div>

            {/* Signup form */}
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
              <div className="mt-5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm Password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>}
              </div>

              {serverError && <p className="text-red-600 mt-2 text-sm">{serverError}</p>}
              {successMessage && <p className="text-green-600 mt-2 text-sm">{successMessage}</p>}

              <Button type="submit" className="mt-5 rounded-full" disabled={isLoading}>
                {isLoading ? "Signing up..." : "Sign up"}
              </Button>
            </form>

            <div className="my-5">
              <p className="text-sm">Or sign up with</p>
              <div className="flex flex-col gap-x-5 mt-3">
                {/* Google OAuth button or additional providers */}
                <div className="flex w-1/3 justify-center rounded-full border-2 border-border bg-gray-100 hover:bg-gray-300 duration-300 cursor-pointer">
                  <Image src="/google-logo.png" alt="Google Logo" width={35} height={35} className="object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
