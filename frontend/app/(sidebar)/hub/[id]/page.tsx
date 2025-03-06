"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Sample blog data - in a real app, you would fetch this based on the ID
const blog = {
  id: 1,
  title: "Sustainable Farming Practices for Modern Agriculture",
  description: "Learn about eco-friendly farming techniques that can increase yield while preserving the environment.",
  date: "2023-05-15",
  author: "Emma Johnson",
  authorRole: "Agricultural Specialist",
  authorImage: "/placeholder.svg?height=100&width=100",
  topic: "Sustainability",
  image: "/placeholder.svg?height=600&width=1200",
  readTime: "5 min read",
  content: `
    <p>Sustainable farming is not just a trend; it's a necessary evolution in agricultural practices to ensure food security for future generations while minimizing environmental impact. This article explores practical, eco-friendly farming techniques that can increase yield while preserving our precious natural resources.</p>
    
    <h2>The Importance of Sustainable Agriculture</h2>
    
    <p>As the global population continues to grow, the demand for food increases, putting pressure on farmers to produce more. However, conventional farming methods often lead to soil degradation, water pollution, and biodiversity loss. Sustainable farming addresses these challenges by working with natural processes rather than against them.</p>
    
    <p>Key benefits of sustainable farming include:</p>
    
    <ul>
      <li>Reduced environmental impact</li>
      <li>Improved soil health and fertility</li>
      <li>Conservation of water resources</li>
      <li>Enhanced biodiversity</li>
      <li>Long-term economic viability</li>
    </ul>
    
    <h2>Crop Rotation and Diversification</h2>
    
    <p>One of the simplest yet most effective sustainable farming practices is crop rotation. By alternating different crops in the same area across growing seasons, farmers can break pest cycles, improve soil structure, and enhance nutrient availability.</p>
    
    <p>Diversification goes hand in hand with rotation. Growing a variety of crops rather than practicing monoculture helps spread risk, improves ecological balance, and can provide multiple income streams for farmers.</p>
    
    <h2>Integrated Pest Management (IPM)</h2>
    
    <p>IPM is an ecosystem-based approach that focuses on long-term prevention of pests through a combination of techniques such as biological control, habitat manipulation, and resistant crop varieties. Chemical pesticides are used only when monitoring indicates they are needed according to established guidelines.</p>
    
    <p>This approach reduces pesticide use, minimizes environmental impact, and helps prevent the development of pesticide-resistant pests.</p>
    
    <h2>Water Conservation Techniques</h2>
    
    <p>Water is a precious resource, and sustainable farming emphasizes its efficient use. Drip irrigation systems deliver water directly to plant roots, reducing evaporation and runoff. Rainwater harvesting systems capture and store rainfall for later use during dry periods.</p>
    
    <p>Additionally, selecting drought-resistant crop varieties and implementing proper soil management practices can significantly reduce water requirements.</p>
    
    <h2>Soil Health Management</h2>
    
    <p>Healthy soil is the foundation of sustainable agriculture. Practices such as minimal tillage, cover cropping, and the application of organic matter help maintain soil structure, prevent erosion, and enhance fertility.</p>
    
    <p>Composting farm waste and applying it back to the fields creates a closed-loop system that reduces the need for synthetic fertilizers while improving soil quality.</p>
    
    <h2>Renewable Energy Integration</h2>
    
    <p>Modern sustainable farms are increasingly incorporating renewable energy sources such as solar panels, wind turbines, and biogas digesters. These technologies reduce dependence on fossil fuels, lower operational costs, and decrease the carbon footprint of agricultural operations.</p>
    
    <h2>Conclusion</h2>
    
    <p>Transitioning to sustainable farming practices requires knowledge, planning, and sometimes initial investment. However, the long-term benefits for farmers, communities, and the environment make it a worthwhile endeavor.</p>
    
    <p>By adopting these eco-friendly techniques, farmers can ensure the viability of their operations while contributing to a healthier planet for future generations.</p>
  `,
  tableOfContents: [
    { id: "importance", title: "The Importance of Sustainable Agriculture", level: 1 },
    { id: "crop-rotation", title: "Crop Rotation and Diversification", level: 1 },
    { id: "ipm", title: "Integrated Pest Management (IPM)", level: 1 },
    { id: "water-conservation", title: "Water Conservation Techniques", level: 1 },
    { id: "soil-health", title: "Soil Health Management", level: 1 },
    { id: "renewable-energy", title: "Renewable Energy Integration", level: 1 },
    { id: "conclusion", title: "Conclusion", level: 1 },
  ],
  relatedArticles: [
    {
      id: 2,
      title: "Optimizing Fertilizer Usage for Maximum Crop Yield",
      topic: "Fertilizers",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 4,
      title: "Water Conservation Techniques for Drought-Prone Areas",
      topic: "Sustainability",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 5,
      title: "Organic Pest Control Methods That Actually Work",
      topic: "Organic",
      image: "/placeholder.svg?height=200&width=300",
    },
  ],
};

export default function BlogPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Scroll to section function
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link href="/knowledge-hub">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to Knowledge Hub
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share article</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save article</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-[1fr_300px] gap-10 max-w-6xl mx-auto">
          {/* Article content */}
          <div>
            {/* Topic badge */}
            <div className="mb-4">
              <Badge className="rounded-full">{blog.topic}</Badge>
            </div>

            {/* Article title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">{blog.title}</h1>

            {/* Article meta */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(blog.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{blog.readTime}</span>
              </div>
              <span>By {blog.author}</span>
            </div>

            {/* Featured image */}
            <div className="relative h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
              <Image src={blog.image || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
            </div>

            {/* Article description */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8">{blog.description}</p>

            {/* Article content */}
            <div className="prose prose-green max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />

            {/* Author bio */}
            <div className="mt-12 p-6 bg-muted rounded-lg">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image src={blog.authorImage || "/placeholder.svg"} alt={blog.author} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold">{blog.author}</h3>
                  <p className="text-sm text-muted-foreground">{blog.authorRole}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Table of contents */}
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Table of Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    {blog.tableOfContents.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`text-left w-full px-2 py-1 text-sm rounded-md hover:bg-muted transition-colors
                            ${item.level > 1 ? "ml-4" : ""}`}>
                        {item.title}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Related articles */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Related Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blog.relatedArticles.map((article) => (
                      <Link href={`/blog/${article.id}`} key={article.id}>
                        <div className="flex gap-3 group">
                          <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={article.image || "/placeholder.svg"}
                              alt={article.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                              {article.title}
                            </h4>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {article.topic}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-2 rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
          aria-label="Scroll to top">
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
