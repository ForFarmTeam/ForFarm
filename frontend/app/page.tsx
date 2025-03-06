import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cloud, BarChart, Zap, Leaf, ChevronRight, Users, Shield, LineChart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-600 to-green-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-green-300/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-800/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* 3D floating elements */}
      <div className="absolute top-1/4 right-10 w-20 h-20 hidden lg:block">
        <div className="relative w-full h-full animate-float animation-delay-1000">
          <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-green-500 rounded-xl shadow-lg transform rotate-12"></div>
        </div>
      </div>
      <div className="absolute bottom-1/4 left-10 w-16 h-16 hidden lg:block">
        <div className="relative w-full h-full animate-float">
          <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-green-400 rounded-xl shadow-lg transform -rotate-12"></div>
        </div>
      </div>

      <div className="relative z-10">
        <header className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="flex font-bold text-xl items-center gap-1.5">
              <Leaf className="h-5 w-5 group-hover:text-green-300 transition-colors" />
              ForFarm
            </span>
            <Badge variant="outline" className="bg-white/10 backdrop-blur-sm text-xs font-normal">
              BETA
            </Badge>
          </Link>
          <nav className="hidden md:flex space-x-6 items-center">
            <Link href="/features" className="hover:text-green-200 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-green-200 transition-colors">
              Pricing
            </Link>
            <Link href="/knowledge-hub" className="hover:text-green-200 transition-colors">
              Knowledge Hub
            </Link>
            <Link href="/documentation" className="hover:text-green-200 transition-colors">
              Documentation
            </Link>
          </nav>
          <div className="flex space-x-3 items-center">
            <Link
              href="/auth/login"
              className="hidden md:inline-block hover:text-green-200 transition-colors font-medium">
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="bg-white text-green-700 font-bold px-4 py-2 rounded-full hover:bg-green-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
              Get started
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 md:py-20">
          {/* Hero section */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-24">
            <div className="max-w-2xl text-left">
              <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                Smart Farming Solution
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Grow Smarter, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-200 to-white">
                  Harvest Better
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-green-100 leading-relaxed">
                Optimize your agricultural business with AI-driven insights and real-time data monitoring. ForFarm helps
                you make informed decisions for sustainable farming.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/setup">
                  <Button className="bg-white text-green-700 text-md font-bold px-6 py-6 rounded-full hover:bg-green-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 w-full sm:w-auto">
                    Start managing your farm
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button
                    variant="outline"
                    className="border-white dark:border-white text-black dark:text-white text-md font-bold px-6 py-6 rounded-full hover:bg-white/10 transition-colors w-full sm:w-auto">
                    Watch demo
                  </Button>
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
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

            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-200 rounded-2xl blur-md opacity-75"></div>
              <div className="relative bg-gradient-to-br from-green-800/90 to-green-900/90 backdrop-blur-sm border border-green-700/50 rounded-2xl p-6 shadow-2xl">
                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl shadow-lg transform rotate-6">
                  <Leaf className="h-6 w-6" />
                </div>
                <Image
                  src="/water-pot.png"
                  alt="ForFarm Dashboard Preview"
                  width={500}
                  height={300}
                  className="rounded-lg shadow-lg mb-4"
                />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">Farm Dashboard</h3>
                    <p className="text-green-200 text-sm">Real-time monitoring</p>
                  </div>
                  <Badge className="bg-green-500">Live Demo</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Features section */}
          <section className="mb-24">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30">
                Why Choose ForFarm
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Smart Features for Modern Farming</h2>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Our platform combines cutting-edge technology with agricultural expertise to help you optimize every
                aspect of your farm.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <BarChart className="h-10 w-10 text-green-300" />,
                  title: "Data-Driven Insights",
                  description:
                    "Make informed decisions with comprehensive analytics and reporting on all aspects of your farm.",
                },
                {
                  icon: <Cloud className="h-10 w-10 text-green-300" />,
                  title: "Weather Integration",
                  description:
                    "Get real-time weather forecasts and alerts tailored to your specific location and crops.",
                },
                {
                  icon: <Zap className="h-10 w-10 text-green-300" />,
                  title: "Resource Optimization",
                  description: "Reduce waste and maximize efficiency with smart resource management tools.",
                },
                {
                  icon: <Users className="h-10 w-10 text-green-300" />,
                  title: "Team Collaboration",
                  description: "Coordinate farm activities and share information seamlessly with your entire team.",
                },
                {
                  icon: <Shield className="h-10 w-10 text-green-300" />,
                  title: "Crop Protection",
                  description: "Identify potential threats to your crops early and get recommendations for protection.",
                },
                {
                  icon: <LineChart className="h-10 w-10 text-green-300" />,
                  title: "Yield Prediction",
                  description: "Use AI-powered models to forecast yields and plan your harvests more effectively.",
                },
              ].map((feature, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-green-200 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative bg-gradient-to-br from-green-800/80 to-green-900/80 backdrop-blur-sm border border-green-700/50 rounded-xl p-6 h-full flex flex-col">
                    <div className="bg-green-900/50 p-3 rounded-lg w-fit mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-green-100">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA section */}
          <section className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-green-300 rounded-2xl blur-md opacity-50"></div>
            <div className="relative bg-gradient-to-br from-green-700/90 to-green-800/90 backdrop-blur-sm border border-green-600/50 rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your farming?</h2>
                <p className="text-green-100 mb-6 md:mb-0 max-w-lg">
                  Join hundreds of farmers who are already using ForFarm to increase yields, reduce costs, and farm more
                  sustainably.
                </p>
              </div>
              <Link href="/auth/signup">
                <Button className="bg-white text-green-700 text-md font-bold px-6 py-6 rounded-full hover:bg-green-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 whitespace-nowrap">
                  Get started for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
        </main>

        <footer className="container mx-auto px-4 py-12 border-t border-green-600/30">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <Link href="/" className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="flex font-bold text-xl items-center gap-1.5">
                <Leaf className="h-5 w-5" />
                ForFarm
              </span>
            </Link>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link href="/features" className="hover:text-green-200 transition-colors text-sm">
                Features
              </Link>
              <Link href="/pricing" className="hover:text-green-200 transition-colors text-sm">
                Pricing
              </Link>
              <Link href="/knowledge-hub" className="hover:text-green-200 transition-colors text-sm">
                Knowledge Hub
              </Link>
              <Link href="/documentation" className="hover:text-green-200 transition-colors text-sm">
                Documentation
              </Link>
              <Link href="/about" className="hover:text-green-200 transition-colors text-sm">
                About Us
              </Link>
              <Link href="/contact" className="hover:text-green-200 transition-colors text-sm">
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-green-200">
            <div className="mb-4 md:mb-0">© {new Date().getFullYear()} ForFarm. All rights reserved.</div>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
