import axiosInstance from "./config";
import type {
  KnowledgeArticle as BackendArticle,
  TableOfContent as BackendTOC,
  RelatedArticle as BackendRelated,
} from "@/types";
import type { Blog } from "@/types";

function mapBackendArticleToFrontendBlog(
  backendArticle: BackendArticle,
  toc?: BackendTOC[],
  related?: BackendRelated[]
): Blog {
  return {
    id: backendArticle.UUID,
    title: backendArticle.Title,
    description: backendArticle.Content.substring(0, 150) + "...",
    date: backendArticle.PublishDate.toString(),
    author: backendArticle.Author,
    topic: backendArticle.Categories.length > 0 ? backendArticle.Categories[0] : "General",
    image: backendArticle.ImageURL || "/placeholder.svg",
    readTime: backendArticle.ReadTime || "5 min read",
    featured: backendArticle.Categories.includes("Featured"),
    content: backendArticle.Content,
    tableOfContents: toc
      ? toc.map((item) => ({
          id: item.UUID,
          title: item.Title,
          level: item.Level,
        }))
      : [],
    relatedArticles: related
      ? related.map((item) => ({
          id: item.UUID,
          title: item.RelatedTitle,
          topic: item.RelatedTag,
          image: "/placeholder.svg",
        }))
      : [],
  };
}

export async function fetchBlogs(): Promise<Blog[]> {
  try {
    interface BackendResponse {
      articles: BackendArticle[];
    }
    const response = await axiosInstance.get<BackendResponse>("/knowledge-hub");

    if (response.data && Array.isArray(response.data.articles)) {
      return response.data.articles.map((article) => mapBackendArticleToFrontendBlog(article));
    } else {
      console.warn("Received unexpected data structure from /knowledge-hub:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching knowledge articles:", error);
    // Return empty array to avoid breaking the UI completely
    return [];
  }
}

export async function fetchBlogById(uuid: string): Promise<Blog | null> {
  try {
    interface BackendSingleResponse {
      article: BackendArticle;
    }
    const articleResponse = await axiosInstance.get<BackendSingleResponse>(`/knowledge-hub/${uuid}`);

    if (articleResponse.data && articleResponse.data.article) {
      const article = articleResponse.data.article;

      // --- Fetch TOC and Related separately ---
      let tocItems: BackendTOC[] = [];
      let relatedItems: BackendRelated[] = [];

      try {
        const tocResponse = await axiosInstance.get<{ table_of_contents: BackendTOC[] }>(`/knowledge-hub/${uuid}/toc`);
        tocItems = tocResponse.data.table_of_contents || [];
      } catch (tocError) {
        console.warn(`Could not fetch TOC for article ${uuid}:`, tocError);
      }

      try {
        const relatedResponse = await axiosInstance.get<{ related_articles: BackendRelated[] }>(
          `/knowledge-hub/${uuid}/related`
        );
        relatedItems = relatedResponse.data.related_articles || [];
      } catch (relatedError) {
        console.warn(`Could not fetch related articles for ${uuid}:`, relatedError);
      }
      // --- End separate fetches ---

      return mapBackendArticleToFrontendBlog(article, tocItems, relatedItems);
    } else {
      console.warn(`Received unexpected data structure from /knowledge-hub/${uuid}:`, articleResponse.data);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching knowledge article by UUID ${uuid}:`, error);
    return null;
  }
}
