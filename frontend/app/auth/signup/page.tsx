import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div>
      <div className="grid grid-cols-[0.7fr_1.2fr] h-screen overflow-hidden">
        <div className="flex bg-[url('/plant-background.jpeg')] bg-cover  bg-center"></div>

        <div className="flex justify-center items-center">
          {/* login box */}
          <div className="container px-[25%]">
            <div className="flex flex-col justify-center items-center">
              <span>
                <Image src={`/forfarm-logo.png`} alt="Forfarm" width={150} height={150}></Image>
              </span>
              <h1 className="text-3xl font-semibold">Hi! Welcome</h1>
              <div className="flex whitespace-nowrap gap-x-2 mt-2">
                <span className="text-md">Already have accounts?</span>
                <span className="text-green-600">
                  <Link href="signin" className="underline">
                    Sign in
                  </Link>
                </span>
              </div>
            </div>

            <div className="flex flex-col mt-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="Email" />
              </div>
              <div className="mt-5">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input type="empasswordail" id="password" placeholder="Password" />
                </div>
              </div>
              <div className="mt-5">
                <div>
                  <Label htmlFor="password">Confirm Password</Label>
                  <Input type="empasswordail" id="password" placeholder="Password" />
                </div>
              </div>

              <Button className="mt-5 rounded-full">Sign up</Button>
            </div>

            <div className="my-5">
              <p className="text-sm">Or log in with</p>
              {/* OAUTH */}
              <div className="flex flex-col gap-x-5 mt-3">
                {/* Google */}
                <div className="flex w-1/3 justify-center rounded-full border-2 border-border bg-gray-100 hover:bg-gray-300 duration-300 cursor-pointer ">
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
