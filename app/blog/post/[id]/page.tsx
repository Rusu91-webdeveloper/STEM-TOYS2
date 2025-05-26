"use client";

import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";

// Import blog posts by category data
import { blogPostsByCategory } from "../../category/[slug]/page";

// Mock data for blog posts - would normally come from a CMS or API
const blogPosts = [
  {
    id: "1",
    title: "Top 10 STEM Toys for Early Childhood Development",
    excerpt:
      "Discover the best STEM toys that help preschoolers develop essential early skills while having fun.",
    date: "May 15, 2023",
    category: "Early Learning",
    image: "/images/category_banner_science_01.png",
    author: "Emily Johnson",
    content: `
      <p>Early childhood is a critical period for brain development, and STEM toys can play a significant role in fostering curiosity, problem-solving skills, and a love for learning. In this article, we explore the top 10 STEM toys specifically designed for children aged 2-6 years.</p>
      
      <h2>Why STEM Toys Matter for Early Development</h2>
      
      <p>Research shows that children who engage with STEM concepts early develop stronger cognitive abilities and are better prepared for academic challenges later in life. STEM toys encourage:</p>
      
      <ul>
        <li>Critical thinking and problem-solving</li>
        <li>Fine motor skills and hand-eye coordination</li>
        <li>Spatial reasoning and planning</li>
        <li>Basic mathematical concepts</li>
        <li>Scientific inquiry and exploration</li>
      </ul>
      
      <h2>Our Top 10 Picks</h2>
      
      <h3>1. Magnetic Building Blocks</h3>
      <p>These colorful magnetic blocks help children understand basic geometry, symmetry, and engineering concepts while building creative structures.</p>
      
      <h3>2. Coding Caterpillar</h3>
      <p>A fun, segmented toy that introduces basic programming concepts without screens. Children arrange segments to create sequences of movements.</p>
      
      <h3>3. Water Wall Building Set</h3>
      <p>This water-play construction set allows children to build pathways for water, teaching them about gravity, flow, and cause-and-effect relationships.</p>
      
      <h3>4. Pattern Matching Tiles</h3>
      <p>These colorful tiles help develop pattern recognition and logical thinking as children recreate designs or create their own patterns.</p>
      
      <h3>5. Counting Garden</h3>
      <p>A tactile toy that combines number recognition with fine motor skills as children "plant" and "harvest" numbered pieces.</p>
      
      <h3>6. Simple Machines Set</h3>
      <p>Introduces young minds to basic physics concepts like levers, pulleys, and inclined planes through hands-on play.</p>
      
      <h3>7. Gear Building Set</h3>
      <p>Interlocking gears teach cause and effect, mechanical motion, and basic engineering principles.</p>
      
      <h3>8. Weather Station Kit</h3>
      <p>A simplified weather observation set that helps children learn about measuring temperature, observing rainfall, and understanding weather patterns.</p>
      
      <h3>9. Building Blocks with Challenge Cards</h3>
      <p>Traditional blocks paired with progressive challenge cards that guide children to build increasingly complex structures.</p>
      
      <h3>10. Nature Exploration Kit</h3>
      <p>Includes simple tools like magnifying glasses, collection jars, and observation journals to encourage scientific observation skills.</p>
      
      <h2>How to Choose the Right STEM Toy</h2>
      
      <p>When selecting STEM toys for early childhood, consider these factors:</p>
      
      <ul>
        <li>Age-appropriateness and safety</li>
        <li>Open-ended play possibilities</li>
        <li>Durability and quality construction</li>
        <li>Alignment with your child's interests</li>
        <li>Progressive challenge levels to grow with your child</li>
      </ul>
      
      <p>The best STEM toys engage children in play they enjoy while subtly introducing foundational concepts that will serve them throughout their educational journey.</p>
    `,
  },
  {
    id: "2",
    title: "How Coding Toys Prepare Children for the Future",
    excerpt:
      "Learn how coding toys and games can help develop computational thinking and prepare kids for tomorrow's jobs.",
    date: "April 28, 2023",
    category: "Technology",
    image: "/images/category_banner_technology_01.png",
    author: "Michael Chen",
    content: `
      <p>In our increasingly digital world, coding literacy is becoming as fundamental as reading and writing. Coding toys offer an engaging way to introduce children to computational thinking concepts through play. This article explores how these toys can help prepare children for future success.</p>
      
      <h2>The Rise of Computational Thinking</h2>
      
      <p>Computational thinking involves breaking down complex problems into manageable parts, recognizing patterns, developing algorithms, and refining solutions—skills valuable across disciplines, not just in programming.</p>
      
      <p>When children engage with coding toys, they're not just learning to code; they're developing a problem-solving mindset applicable to mathematics, science, and even creative pursuits like music and writing.</p>
      
      <h2>Popular Coding Toys and Their Benefits</h2>
      
      <h3>Screen-Free Coding Toys</h3>
      <p>These toys introduce coding concepts without digital devices:</p>
      <ul>
        <li><strong>Coding Robot Kits:</strong> Physical robots that children can program using sequence cards, buttons, or simple block-based interfaces</li>
        <li><strong>Coding Board Games:</strong> Tabletop games that teach sequence, logic, and algorithmic thinking</li>
        <li><strong>Building Sets with Coding Challenges:</strong> Construction toys that incorporate programming elements</li>
      </ul>
      
      <h3>Digital Coding Platforms</h3>
      <p>These apps and games create engaging digital environments for learning:</p>
      <ul>
        <li><strong>Block-Based Coding Apps:</strong> Visual programming interfaces where children connect blocks to create programs</li>
        <li><strong>Coding Adventure Games:</strong> Story-driven games that incorporate coding challenges</li>
        <li><strong>Creative Coding Platforms:</strong> Tools that let children create their own games, stories, and animations</li>
      </ul>
      
      <h2>Beyond Coding: Essential Skills for the Future</h2>
      
      <p>Coding toys help develop several key competencies identified as crucial for future workplaces:</p>
      
      <h3>Critical Thinking and Problem-Solving</h3>
      <p>Coding activities require children to analyze problems, plan solutions, test their ideas, and refine their approach when things don't work as expected.</p>
      
      <h3>Resilience and Learning from Failure</h3>
      <p>Debugging code teaches children that mistakes are opportunities for learning and that persistence leads to success—a growth mindset essential for lifelong learning.</p>
      
      <h3>Creativity and Innovation</h3>
      <p>Many coding toys allow children to create their own games, stories, or animations, fostering creative expression and innovative thinking.</p>
      
      <h3>Collaboration</h3>
      <p>Pair programming activities and group coding projects teach children to communicate ideas clearly and work together toward shared goals.</p>
      
      <h2>Choosing Age-Appropriate Coding Toys</h2>
      
      <h3>Ages 3-5</h3>
      <p>Focus on screen-free options that teach sequencing, patterns, and cause-effect relationships through physical play.</p>
      
      <h3>Ages 6-8</h3>
      <p>Introduce simple block-based programming with immediate visual feedback. Robots that follow commands are especially engaging at this age.</p>
      
      <h3>Ages 9-12</h3>
      <p>Explore more complex programming concepts with tools that allow for creative expression and meaningful projects.</p>
      
      <h3>Teens</h3>
      <p>Consider platforms that introduce text-based coding languages and support the creation of more sophisticated projects.</p>
      
      <h2>Balancing Screen Time and Hands-On Learning</h2>
      
      <p>While digital coding platforms offer valuable learning experiences, balance screen-based activities with physical coding toys and unplugged activities. This comprehensive approach helps children develop a well-rounded understanding of computational concepts.</p>
      
      <p>By introducing coding toys at an early age and progressively advancing to more complex tools, parents and educators can help children develop not just coding skills, but the fundamental thinking patterns and problem-solving approaches that will serve them well in whatever future they create.</p>
    `,
  },
  {
    id: "3",
    title: "The Science Behind Effective Educational Toys",
    excerpt:
      "Understanding how educational toys are designed to maximize learning outcomes through play-based approaches.",
    date: "March 12, 2023",
    category: "Research",
    image: "/images/category_banner_engineering_01.png",
    author: "Dr. Sarah Williams",
    content: `
      <p>Educational toys aren't just playthings—they're carefully engineered learning tools designed based on developmental psychology, neuroscience, and educational theory. This article explores the scientific principles that make effective educational toys so powerful for childhood learning.</p>
      
      <h2>How Children Learn Through Play</h2>
      
      <p>Play is the brain's preferred way to learn. When children play, their brains release dopamine and endorphins that create positive associations with learning and help form stronger neural connections. This is why information acquired through enjoyable play activities is often better retained than lessons delivered through direct instruction.</p>
      
      <h3>The Neuroscience of Playful Learning</h3>
      
      <p>Research using functional MRI has shown that multiple brain regions activate simultaneously during play-based learning:</p>
      
      <ul>
        <li>The prefrontal cortex (executive function and decision-making)</li>
        <li>The hippocampus (memory formation)</li>
        <li>The amygdala (emotional processing)</li>
        <li>Motor cortex areas (physical skills)</li>
      </ul>
      
      <p>This multi-region activation creates rich, interconnected neural networks that support deeper learning and better knowledge transfer to new situations.</p>
      
      <h2>Key Design Principles in Educational Toys</h2>
      
      <h3>Optimal Challenge Level</h3>
      
      <p>Educational toys are most effective when they operate in what psychologist Lev Vygotsky called the "Zone of Proximal Development"—challenging enough to be engaging but not so difficult that children become frustrated. Well-designed toys often incorporate progressive difficulty levels that grow with the child.</p>
      
      <h3>Multi-Sensory Engagement</h3>
      
      <p>Toys that engage multiple senses create stronger memory formation. When children simultaneously see, hear, and manipulate objects, they process information through multiple neural pathways, reinforcing learning and improving recall.</p>
      
      <h3>Immediate Feedback Mechanisms</h3>
      
      <p>Effective educational toys provide clear, immediate feedback that helps children understand cause-and-effect relationships. This feedback loop—whether through lights, sounds, physical movements, or visual changes—allows children to test hypotheses and refine their understanding.</p>
      
      <h3>Open-Ended Design</h3>
      
      <p>Toys that can be used in multiple ways foster creativity and adaptability. Open-ended toys like blocks, art supplies, and construction sets allow children to create their own learning experiences, promoting deeper engagement and personalized learning.</p>
      
      <h2>The Role of Guided Play</h2>
      
      <p>Research shows that guided play—where adults provide subtle structure and prompts while still allowing child-led exploration—maximizes the educational value of toy-based learning. This balance allows children to feel ownership of their play while benefiting from intentional learning scaffolds.</p>
      
      <h2>From Theory to Practice: Evaluating Educational Toys</h2>
      
      <p>When assessing the potential educational value of a toy, consider these research-backed questions:</p>
      
      <ul>
        <li>Does it engage active, minds-on play rather than passive consumption?</li>
        <li>Does it encourage social interaction and communication?</li>
        <li>Does it provide appropriate challenge without overwhelming the child?</li>
        <li>Does it align with developmental milestones and learning progressions?</li>
        <li>Does it sustain interest through multiple play sessions?</li>
      </ul>
      
      <p>The most effective educational toys answer "yes" to most of these questions while still being fundamentally enjoyable for the child.</p>
      
      <h2>The Future of Educational Toy Design</h2>
      
      <p>Emerging research in learning sciences and advances in materials and technology are continuing to transform educational toy design. Trends to watch include:</p>
      
      <ul>
        <li>Adaptive toys that adjust difficulty based on the child's performance</li>
        <li>Toys that blend physical and digital interactions in developmentally appropriate ways</li>
        <li>Increased focus on social-emotional learning alongside cognitive development</li>
        <li>Greater cultural responsiveness and inclusivity in design</li>
      </ul>
      
      <p>By understanding the science behind effective educational toys, parents and educators can make more informed choices about the learning tools they provide to children, maximizing developmental benefits while preserving the joy of play.</p>
    `,
  },
  {
    id: "4",
    title: "Building Skills Through Construction Toys",
    excerpt:
      "How construction and building toys help develop spatial reasoning, planning, and problem-solving abilities.",
    date: "February 20, 2023",
    category: "Engineering",
    image: "/images/category_banner_math_01.png",
    author: "David Rodriguez",
    content: `
      <p>Construction toys—from wooden blocks to elaborate building systems—offer some of the richest opportunities for cognitive development through play. This article explores how these versatile tools build crucial skills that extend far beyond the playroom.</p>
      
      <h2>The Cognitive Architecture of Building Play</h2>
      
      <p>When children engage with construction toys, they're exercising sophisticated mental processes:</p>
      
      <ul>
        <li><strong>Spatial Reasoning:</strong> Visualizing how pieces fit together and understanding three-dimensional relationships</li>
        <li><strong>Executive Function:</strong> Planning ahead, focusing attention, and organizing actions in sequence</li>
        <li><strong>Mathematical Thinking:</strong> Exploring symmetry, patterns, geometry, and measurement</li>
        <li><strong>Problem-Solving:</strong> Overcoming structural challenges and revising approaches when initial attempts fail</li>
      </ul>
      
      <p>These cognitive skills form a foundation for success across academic disciplines and life situations.</p>
      
      <h2>From Simple Stacking to Complex Systems</h2>
      
      <p>The developmental journey through construction play typically follows a predictable progression:</p>
      
      <h3>Stage 1: Basic Manipulation (Ages 1-2)</h3>
      <p>Children begin by simply handling pieces, stacking a few blocks, or fitting simple shapes together. This builds fine motor skills and basic cause-effect understanding.</p>
      
      <h3>Stage 2: Horizontal and Vertical Structures (Ages 2-4)</h3>
      <p>Children create rows, towers, and simple enclosures, developing concepts of stability, balance, and spatial organization.</p>
      
      <h3>Stage 3: Bridges and Arches (Ages 4-6)</h3>
      <p>More complex structures emerge as children discover how to create spans and supports, demonstrating advanced understanding of structural principles.</p>
      
      <h3>Stage 4: Representational Building (Ages 5-8)</h3>
      <p>Children begin to create structures that represent real-world objects or imaginary places, integrating symbolic thinking with construction skills.</p>
      
      <h3>Stage 5: Technical Building (Ages 7+)</h3>
      <p>Advanced builders incorporate moving parts, functional elements, and precise specifications, often following complex instructions or creating original designs with specific performance goals.</p>
      
      <h2>Building Across Domains: Unexpected Benefits</h2>
      
      <p>Research has linked construction play to development in several surprising areas:</p>
      
      <h3>Language Development</h3>
      <p>Construction activities promote rich vocabulary (balance, symmetry, support) and communication as children describe their creations and processes.</p>
      
      <h3>Social Skills</h3>
      <p>Collaborative building projects teach negotiation, turn-taking, and appreciation of others' ideas and contributions.</p>
      
      <h3>Emotional Regulation</h3>
      <p>The inevitable collapses and structural failures of building provide natural opportunities to develop resilience and manage frustration.</p>
      
      <h3>Creative Expression</h3>
      <p>Open-ended construction materials become mediums for artistic and imaginative expression, particularly as children begin to tell stories about their creations.</p>
      
      <h2>Optimizing the Building Experience</h2>
      
      <p>Parents and educators can enhance the developmental value of construction play by:</p>
      
      <ul>
        <li>Providing ample space and time for extended building projects</li>
        <li>Offering a variety of construction materials with different properties and connection systems</li>
        <li>Asking thoughtful questions about structural choices and building challenges</li>
        <li>Documenting the building process through photos or videos to review and discuss</li>
        <li>Connecting building activities to real-world structures and engineering principles</li>
      </ul>
      
      <p>The most valuable construction play experiences balance freedom for exploration with appropriate challenges that stretch children's thinking and skills.</p>
      
      <h2>Digital Construction: New Frontiers</h2>
      
      <p>Virtual building environments like Minecraft and digital design tools offer new dimensions to construction play. These platforms can extend physical building experiences by:</p>
      
      <ul>
        <li>Removing physical constraints of gravity and material limitations</li>
        <li>Enabling creation at different scales, from microscopic to monumental</li>
        <li>Introducing programming concepts through automated elements</li>
        <li>Connecting young builders in collaborative projects across distances</li>
      </ul>
      
      <p>While these digital tools offer valuable opportunities, they work best as complements to rather than replacements for physical construction play.</p>
      
      <p>Whether stacking simple blocks or engineering complex mechanical systems, construction toys offer a powerful combination of immediate enjoyment and long-term developmental benefits, building both structures and minds piece by piece.</p>
    `,
  },
];

// Combine both data sources for blog posts
const allBlogPosts = {
  ...Object.fromEntries(
    Object.entries(blogPostsByCategory).map(([category, posts]) => [
      category,
      posts,
    ])
  ),
  // Add numeric ID posts from original data
  ...Object.fromEntries(blogPosts.map((post) => [post.id, [post]])),
};

export default function BlogPost() {
  const { id } = useParams();
  const { t } = useTranslation();

  // Convert ID to string if it's an array
  const postId = Array.isArray(id) ? id[0] : id;

  // Try to find the post from the combined blog posts data
  let post = null;

  // First check if it's a category-specific post
  for (const [_, posts] of Object.entries(allBlogPosts)) {
    if (Array.isArray(posts)) {
      const foundPost = posts.find((p) => p.id === postId);
      if (foundPost) {
        post = foundPost;
        break;
      }
    }
  }

  // If post is not found, return 404
  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Blog Post Hero */}
      <section className="relative pt-10 pb-12 md:pt-12 md:pb-16">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
          <div className="mb-4">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80 p-0 h-auto"
              asChild>
              <Link
                href="/blog"
                className="flex items-center gap-1">
                <ArrowLeft size={16} />
                <span>{t("backToBlog")}</span>
              </Link>
            </Button>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-indigo-900">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-indigo-700">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <User size={16} />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag size={16} />
              <span>{post.category}</span>
            </div>
          </div>

          <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 w-full rounded-xl overflow-hidden mb-8">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              style={{ objectFit: "cover" }}
              priority
              className="transition-transform hover:scale-105 duration-700"
            />
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-8 md:py-12">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
          <div
            className="prose prose-indigo max-w-none prose-headings:text-indigo-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-800 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}></div>

          <div className="mt-12 pt-8 border-t border-indigo-100">
            <h3 className="text-xl font-bold mb-6 text-indigo-900">
              Share This Article
            </h3>
            <div className="flex gap-3">
              <Button
                size="sm"
                className="bg-[#3b5998] hover:bg-[#3b5998]/90 text-white">
                Facebook
              </Button>
              <Button
                size="sm"
                className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white">
                Twitter
              </Button>
              <Button
                size="sm"
                className="bg-[#0077B5] hover:bg-[#0077B5]/90 text-white">
                LinkedIn
              </Button>
              <Button
                size="sm"
                className="bg-[#25D366] hover:bg-[#25D366]/90 text-white">
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-12 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-indigo-900">
            {t("relatedArticles")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts
              .filter((p) => p.id !== postId && p.category === post.category)
              .slice(0, 3)
              .map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md border border-indigo-100 hover:shadow-xl hover:border-indigo-200 transition-all transform hover:-translate-y-1 duration-300">
                  <div className="relative h-48 w-full">
                    <Image
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      style={{ objectFit: "cover" }}
                      className="transition-transform hover:scale-105 duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium shadow-sm border border-indigo-200/50">
                        {relatedPost.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-indigo-900 line-clamp-2 hover:text-indigo-700 transition-colors">
                      <Link href={`/blog/post/${relatedPost.id}`}>
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 shadow-sm transition-all"
                      size="sm"
                      asChild>
                      <Link href={`/blog/post/${relatedPost.id}`}>
                        {t("readMore")}
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-12 bg-white">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-xl p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t("stayUpdated")}
              </h2>
              <p className="mb-6 max-w-2xl">{t("newsletterDescription")}</p>
              <div className="w-full max-w-md flex gap-2">
                <input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className="flex-1 px-4 py-2 rounded-md border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                />
                <Button className="bg-white text-indigo-700 hover:bg-white/90 border-none">
                  {t("subscribe")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
