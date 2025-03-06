import axiosInstance from "./config";
import type { Blog } from "@/types";

// Dummy blog data used as a fallback.
const dummyBlogs: Blog[] = [
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
    content: `<p>Sustainable farming is not just a trend; it's a necessary evolution in agricultural practices. […]</p>`,
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
        description: "",
        date: "",
        author: "",
        readTime: "",
        featured: false,
      },
      {
        id: 4,
        title: "Water Conservation Techniques for Drought-Prone Areas",
        topic: "Sustainability",
        image: "/placeholder.svg?height=200&width=300",
        description: "",
        date: "",
        author: "",
        readTime: "",
        featured: false,
      },
      {
        id: 5,
        title: "Organic Pest Control Methods That Actually Work",
        topic: "Organic",
        image: "/placeholder.svg?height=200&width=300",
        description: "",
        date: "",
        author: "",
        readTime: "",
        featured: false,
      },
    ],
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

/**
 * Fetches a list of blog posts.
 * Simulates a network delay and returns dummy data when the API endpoint is unavailable.
 */
export async function fetchBlogs(): Promise<Blog[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    const response = await axiosInstance.get<Blog[]>("/api/blogs");
    return response.data;
  } catch (error) {
    return dummyBlogs;
  }
}

/**
 * Fetches a single blog post by its id.
 * Returns the API result if available; otherwise falls back to dummy data.
 */
export async function fetchBlogById(id: string): Promise<Blog | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  try {
    const response = await axiosInstance.get<Blog>(`/api/blogs/${id}`);
    return response.data;
  } catch (error) {
    const blog = dummyBlogs.find((blog) => blog.id === Number(id));
    return blog || null;
  }
}
