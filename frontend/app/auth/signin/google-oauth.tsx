import Image from "next/image";

export function GoogleSigninButton() {
  return (
    <div className="flex w-1/3 justify-center rounded-full border-2 border-border bg-gray-100 hover:bg-gray-300 duration-300 cursor-pointer ">
      <Image src="/google-logo.png" alt="Google Logo" width={35} height={35} className="object-contain" />
    </div>
  );
}
