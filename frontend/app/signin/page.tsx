export default function Signin() {
  return (
    <div>
      <div className="grid grid-cols-[1fr_1.5fr] gap-0  h-screen">
        <div className=" bg-red-200"></div>
        <div className="bg-green-200 flex justify-center items-center">
          {/* login box */}
          <div className="flex w-[600px] h-[600px] bg-yellow-200 ">
            <h1 className="text-3xl">Login</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
