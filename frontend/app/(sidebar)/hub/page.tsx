"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarIcon, ChevronRight, Leaf, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Sample blog data
const blogs = [
  {
    id: 1,
    title: "Sustainable Farming Practices for Modern Agriculture",
    description:
      "Learn about eco-friendly farming techniques that can increase yield while preserving the environment.",
    date: "2023-05-15",
    author: "Emma Johnson",
    topic: "Sustainability",
    image: "/placeholder.svg?height=400&width=600",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: 2,
    title: "Optimizing Fertilizer Usage for Maximum Crop Yield",
    description: "Discover the perfect balance of fertilizers to maximize your harvest without wasting resources.",
    date: "2023-06-02",
    author: "Michael Chen",
    topic: "Fertilizers",
    image: "/placeholder.svg?height=400&width=600",
    readTime: "7 min read",
    featured: false,
  },
  {
    id: 3,
    title: "Seasonal Planting Guide: What to Grow and When",
    description:
      "A comprehensive guide to help you plan your planting schedule throughout the year for optimal results.",
    date: "2023-06-18",
    author: "Sarah Williams",
    topic: "Plantation",
    image: "/placeholder.svg?height=400&width=600",
    readTime: "8 min read",
    featured: false,
  },
  {
    id: 4,
    title: "Water Conservation Techniques for Drought-Prone Areas",
    description: "Essential strategies to maintain your crops during water shortages and drought conditions.",
    date: "2023-07-05",
    author: "David Rodriguez",
    topic: "Sustainability",
    image: "/placeholder.svg?height=400&width=600",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: 5,
    title: "Organic Pest Control Methods That Actually Work",
    description: "Natural and effective ways to keep pests at bay without resorting to harmful chemicals.",
    date: "2023-07-22",
    author: "Lisa Thompson",
    topic: "Organic",
    image: "/placeholder.svg?height=400&width=600",
    readTime: "9 min read",
    featured: false,
  },
  {
    id: 6,
    title: "The Future of Smart Farming: IoT and Agriculture",
    description: "How Internet of Things technology is revolutionizing the way we monitor and manage farms.",
    date: "2023-08-10",
    author: "James Wilson",
    topic: "Technology",
    image: "/placeholder.svg?height=400&width=600",
    readTime: "10 min read",
    featured: true,
  },
];

// Extract unique topics from blogs
const topics = ["All", ...new Set(blogs.map((blog) => blog.topic))];

export default function KnowledgeHubPage() {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter blogs based on selected topic and search query
  const filteredBlogs = blogs.filter((blog) => {
    const matchesTopic = selectedTopic === "All" || blog.topic === selectedTopic;
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  // Get featured blogs
  const featuredBlogs = blogs.filter((blog) => blog.featured);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Knowledge Hub</h1>
                <p className="text-muted-foreground mt-2">
                  Explore our collection of articles, guides, and resources to help you grow better.
                </p>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Featured article */}
            {featuredBlogs.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Featured Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredBlogs.slice(0, 2).map((blog) => (
                    <Card key={blog.id} className="overflow-hidden group">
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={blog.image || "/placeholder.svg"}
                          alt={blog.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6 text-white">
                          <Badge className="bg-primary hover:bg-primary/90 mb-2">{blog.topic}</Badge>
                          <h3 className="text-xl font-bold">{blog.title}</h3>
                          <div className="flex items-center mt-2 text-sm">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            <span>{new Date(blog.date).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span>{blog.readTime}</span>
                          </div>
                        </div>
                      </div>
                      <CardFooter className="p-4 flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">By {blog.author}</div>
                        <Link href={`/blog/${blog.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            Read more <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Topic filters */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Browse by Topic</h2>
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <Button
                    key={topic}
                    variant={selectedTopic === topic ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTopic(topic)}
                    className="rounded-full">
                    {topic === "Sustainability" && <Leaf className="mr-1 h-4 w-4" />}
                    {topic}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Blog grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No articles found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              ) : (
                filteredBlogs.map((blog) => (
                  <Card key={blog.id} className="overflow-hidden group h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={blog.image || "/placeholder.svg"}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{blog.topic}</Badge>
                        <div className="text-xs text-muted-foreground">{new Date(blog.date).toLocaleDateString()}</div>
                      </div>
                      <CardTitle className="text-lg">{blog.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex-grow">
                      <CardDescription className="line-clamp-2">{blog.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">By {blog.author}</div>
                      <Link href={`/blog/${blog.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Read <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination - simplified for this example */}
            {filteredBlogs.length > 0 && (
              <div className="flex justify-center mt-12">
                <Button variant="outline" size="sm" className="mx-1">
                  1
                </Button>
                <Button variant="ghost" size="sm" className="mx-1">
                  2
                </Button>
                <Button variant="ghost" size="sm" className="mx-1">
                  3
                </Button>
                <Button variant="ghost" size="sm" className="mx-1">
                  ...
                </Button>
                <Button variant="ghost" size="sm" className="mx-1">
                  Next
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
