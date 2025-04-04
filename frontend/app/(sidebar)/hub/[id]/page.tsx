"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { fetchBlogById } from "@/api/hub";
import type { Blog } from "@/types";

export default function BlogPage() {
  // Get the dynamic route parameter.
  const params = useParams();
  const blogId = params.id as string;

  // Fetch the blog based on its id.
  const {
    data: blog,
    isLoading,
    isError,
  } = useQuery<Blog | null>({
    queryKey: ["blog", blogId],
    queryFn: () => fetchBlogById(blogId),
    staleTime: 60 * 1000,
  });

  // Local state for the "scroll to top" button.
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen bg-background items-center justify-center">Loading...</div>;
  }

  if (isError || !blog) {
    return <div className="flex min-h-screen bg-background items-center justify-center">Error loading blog.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link href="/hub">
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
            <div className="mb-4">
              <Badge className="rounded-full">{blog.topic}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">{blog.title}</h1>
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
            <div className="relative h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
              <Image src={blog.image || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
            </div>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">{blog.description}</p>
            <div className="prose prose-green max-w-none" dangerouslySetInnerHTML={{ __html: blog.content || "" }} />
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
                    {blog.tableOfContents?.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`text-left w-full px-2 py-1 text-sm rounded-md hover:bg-muted transition-colors ${
                          item.level > 1 ? "ml-4" : ""
                        }`}>
                        {item.title}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Related articles */}
              {blog.relatedArticles && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Related Articles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {blog.relatedArticles.map((article) => (
                        <Link href={`/hub/${article.id}`} key={article.id}>
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
              )}
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
