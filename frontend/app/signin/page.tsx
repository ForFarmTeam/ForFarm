import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ForgotPasswordModal from "./forgot-password-modal";

import Link from "next/link";
import Image from "next/image";

export default function Signin() {
  return (
    <div>
      <div className="grid grid-cols-[1fr_1.5fr] gap-0  h-screen">
        <div className=" bg-red-200"></div>
        <div className="bg-green-200 flex justify-center items-center">
          {/* login box */}
          <div className="w-[560px] h-[600px] bg-yellow-200">
            <div className="flex flex-col gap-5  justify-center items-center">
              <h1 className="text-4xl mt-5 font-semibold">Log In</h1>
              <div className="flex whitespace-nowrap gap-x-2">
                <span>Don&apos;t have an account?</span>
                <span className="text-green-600">
                  <Link href="#">Sign up</Link>
                </span>
              </div>
            </div>

            {/* OAUTH */}
            <div className="flex flex-col items-center mt-10 gap-x-5">
              {/* Google */}
              <div className="flex justify-center  rounded-full bg-gray-200 hover:bg-gray-300 duration-300 w-[90] h-[55] cursor-pointer ">
                <Image
                  src="/google-logo.png"
                  alt="Google Logo"
                  width={35}
                  height={35}
                  className="object-contain"
                ></Image>
              </div>
            </div>

            <div className="flex flex-col mt-10 ">
              <div>
                <h1 className="whitespace-nowrap flex items-start ml-24">
                  EMAIL <span className="text-red-500">*</span>
                </h1>
                <div className="flex flex-col items-center">
                  <Input type="email" className="w-2/3 mt-3" />
                </div>
              </div>
              <div className="mt-5">
                <h1 className="whitespace-nowrap flex items-start ml-24">
                  PASSWORD <span className="text-red-500">*</span>
                </h1>
                <div className="flex flex-col items-center">
                  <Input type="password" className="w-2/3 mt-3" />
                </div>
              </div>
              <ForgotPasswordModal />
            </div>
            <div className="flex justify-center mt-5">
              <Button>Submit</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
