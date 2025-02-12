import { Input } from "@/components/ui/input";

export default function Signin() {
  return (
    <div>
      <div className="grid grid-cols-[1fr_1.5fr] gap-0  h-screen">
        <div className=" bg-red-200"></div>
        <div className="bg-green-200 flex justify-center items-center">
          {/* login box */}
          <div className="w-[560px] h-[600px] bg-yellow-200">
            <div className="flex flex-col gap-5  justify-center items-center">
              <h1 className="text-4xl mt-5 font-semibold">Login</h1>
              <div className="flex whitespace-nowrap gap-x-2">
                <span>Don&apos;t have an account?</span>
                <span className="text-green-600">Sign up</span>
              </div>
            </div>

            <div className="flex flex-col mt-10">
              <h1 className="whitespace-nowrap flex items-start">
                EMAIL <span className="text-red-500">*</span>
              </h1>
              <div className="flex flex-col items-center">
                <Input className="w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
