import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cloud, BarChart, Zap } from "lucide-react";
import { Leaf } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-600 to-green-900 text-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="flex font-bold text-xl">
            <Leaf />
            ForFarm
          </span>
        </Link>
        <span className="flex space-x-4 items-center">
          <Link href="/documentation" className="hover:text-gray-200 transition-colors font-bold">
            Documentation
          </Link>
          <Link
            href="/auth/signup"
            className="bg-white text-blue-600 font-bold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors">
            Get started
          </Link>
        </span>
      </header>

      <main className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <Image
            src="/water-pot.png"
            alt="ForFarm Icon"
            width={100}
            height={100}
            className="mx-auto mb-8 rounded-2xl"
          />
          <h1 className="text-6xl font-bold mb-6">Your Smart Farming Platform</h1>
          <p className="text-xl md:text-2xl mb-12 text-gray-200">
            It's a smart and easy way to optimize your agricultural business, with the help of AI-driven insights and
            real-time data.
          </p>
          <Link href="/auth/signin">
            <Button className="bg-black text-white text-md font-bold px-4 py-6 rounded-full hover:bg-gray-600">
              Manage your farm
            </Button>
          </Link>
        </div>
      </main>

      {/* <div className="absolute -inset-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg blur opacity-10"></div> */}

      <footer className="container mx-auto px-4 py-6 text-center text-sm text-gray-300">
        <Link href="#" className="hover:text-white transition-colors">
          Terms
        </Link>
        {" • "}
        <Link href="#" className="hover:text-white transition-colors">
          Privacy
        </Link>
        {" • "}
        <Link href="#" className="hover:text-white transition-colors">
          Cookies
        </Link>
      </footer>
    </div>
  );
}
