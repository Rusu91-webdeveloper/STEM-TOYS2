import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data for blog posts
const blogPosts = [
  {
    id: "1",
    title: "Top 10 STEM Toys for Early Childhood Development",
    excerpt:
      "Discover the best STEM toys that help preschoolers develop essential early skills while having fun.",
    date: "May 15, 2023",
    category: "Early Learning",
    image: "https://placehold.co/600x400/4F46E5/FFFFFF.png?text=STEM+Toys",
    author: "Emily Johnson",
  },
  {
    id: "2",
    title: "How Coding Toys Prepare Children for the Future",
    excerpt:
      "Learn how coding toys and games can help develop computational thinking and prepare kids for tomorrow's jobs.",
    date: "April 28, 2023",
    category: "Technology",
    image: "https://placehold.co/600x400/10B981/FFFFFF.png?text=Coding+Toys",
    author: "Michael Chen",
  },
  {
    id: "3",
    title: "The Science Behind Effective Educational Toys",
    excerpt:
      "Understanding how educational toys are designed to maximize learning outcomes through play-based approaches.",
    date: "March 12, 2023",
    category: "Research",
    image:
      "https://placehold.co/600x400/F59E0B/FFFFFF.png?text=Educational+Toys",
    author: "Dr. Sarah Williams",
  },
  {
    id: "4",
    title: "Building Skills Through Construction Toys",
    excerpt:
      "How construction and building toys help develop spatial reasoning, planning, and problem-solving abilities.",
    date: "February 20, 2023",
    category: "Engineering",
    image:
      "https://placehold.co/600x400/EF4444/FFFFFF.png?text=Construction+Toys",
    author: "David Rodriguez",
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/blog_homepage_hero_01.png"
            alt="STEM Toys Blog - Educational articles and insights"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="container relative z-10 text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            STEM Learning Blog
          </h1>
          <p className="text-lg md:text-xl mb-6 max-w-2xl">
            Insights, tips, and the latest research on educational toys and STEM
            learning
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-white hover:bg-white/10 border-white">
              <Link href="/blog/category/early-learning">Early Learning</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-white hover:bg-white/10 border-white">
              <Link href="/blog/category/technology">Technology</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-white hover:bg-white/10 border-white">
              <Link href="/blog/category/research">Research</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-white hover:bg-white/10 border-white">
              <Link href="/blog/category/engineering">Engineering</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="bg-[hsl(var(--background))] rounded-lg overflow-hidden shadow-md border border-[hsl(var(--border))]">
                <div className="relative h-48 w-full">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      By {post.author}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild>
                      <Link href={`/blog/${post.id}`}>Read More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-12 bg-muted">
        <div className="container">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="mb-6 max-w-2xl">
              Subscribe to our newsletter for the latest articles, educational
              resources, and STEM toy recommendations.
            </p>
            <div className="w-full max-w-md flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-2 rounded-md border border-input bg-[hsl(var(--background))]"
              />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
