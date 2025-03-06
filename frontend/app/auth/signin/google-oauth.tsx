import Image from "next/image";

export function GoogleSigninButton() {
  return (
    <div className="flex items-center justify-center gap-3 w-full py-2 px-4 rounded-full border border-border bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer">
      <Image src="/google-logo.png" alt="Google Logo" width={35} height={35} className="object-contain" />
      <span className="font-medium text-gray-800 dark:text-gray-100">Sign in with Google</span>
    </div>
  );
}
