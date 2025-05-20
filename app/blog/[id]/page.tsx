"use client";

import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";

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
      
      <p>Toys with multiple possible uses encourage divergent thinking and creativity. Research shows that open-ended toys (like blocks, modeling clay, or versatile construction sets) promote executive function development and problem-solving skills more effectively than toys with single predetermined outcomes.</p>
      
      <h2>Age-Specific Design Considerations</h2>
      
      <h3>Infant Toys (0-12 months)</h3>
      
      <p>Based on sensorimotor development principles, these toys focus on:</p>
      <ul>
        <li>High-contrast visual patterns that support visual tracking</li>
        <li>Varied textures that encourage tactile exploration</li>
        <li>Cause-effect relationships (e.g., press a button, hear a sound)</li>
      </ul>
      
      <h3>Toddler Toys (1-3 years)</h3>
      
      <p>Designed for emerging symbolic thinking and language development:</p>
      <ul>
        <li>Shape sorters and simple puzzles that build categorization skills</li>
        <li>Pretend play props that support symbolic thinking</li>
        <li>First building sets that develop spatial reasoning</li>
      </ul>
      
      <h3>Preschool Toys (3-5 years)</h3>
      
      <p>Focus on pre-academic skills and social development:</p>
      <ul>
        <li>Pattern recognition games that build mathematical foundations</li>
        <li>Letter and number toys that introduce literacy concepts</li>
        <li>Cooperative games that develop social skills</li>
      </ul>
      
      <h3>School-Age Toys (6+ years)</h3>
      
      <p>Support more complex thinking and specialized interests:</p>
      <ul>
        <li>Science kits that encourage the scientific method</li>
        <li>Complex construction sets that develop engineering concepts</li>
        <li>Strategy games that build critical thinking</li>
      </ul>
      
      <h2>The Role of Guided Play</h2>
      
      <p>Research by developmental psychologists has found that "guided play"—where adults subtly scaffold children's exploration with educational toys—often leads to better learning outcomes than either purely free play or direct instruction. This approach maintains the child's autonomy while gently extending learning opportunities.</p>
      
      <h2>Measuring Educational Impact</h2>
      
      <p>Manufacturers of high-quality educational toys often collaborate with child development experts and conduct research studies to measure learning outcomes. These studies typically assess:</p>
      
      <ul>
        <li>Engagement duration and frequency</li>
        <li>Skill development across different domains</li>
        <li>Knowledge transfer to new situations</li>
        <li>Long-term retention of concepts</li>
      </ul>
      
      <p>The most effective educational toys show measurable improvements in specific developmental domains while maintaining high levels of child engagement and enjoyment.</p>
      
      <h2>Conclusion</h2>
      
      <p>By understanding the science behind educational toy design, parents and educators can make more informed choices about the learning tools they provide to children. The best educational toys aren't just about teaching specific facts or skills—they're about creating joyful learning experiences that build positive associations with discovery and problem-solving that last a lifetime.</p>
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
      <p>Construction toys—from wooden blocks to advanced building systems—are among the most valuable learning tools available to children. This article explores how these toys foster crucial developmental skills and why they remain essential in a digital age.</p>
      
      <h2>The Developmental Power of Construction Play</h2>
      
      <p>When children build, they're not just stacking blocks—they're developing a sophisticated set of cognitive, physical, and social-emotional skills that will benefit them throughout life.</p>
      
      <h3>Spatial Reasoning and Mathematical Thinking</h3>
      
      <p>Construction play develops spatial awareness and geometric understanding as children experiment with:</p>
      
      <ul>
        <li>Balance and stability</li>
        <li>Symmetry and patterns</li>
        <li>Proportional reasoning</li>
        <li>Mental rotation and visualization</li>
      </ul>
      
      <p>Research has consistently found strong correlations between early spatial play and later mathematics achievement, particularly in geometry and engineering.</p>
      
      <h3>Executive Function Development</h3>
      
      <p>Building projects require children to exercise core executive functions:</p>
      
      <ul>
        <li><strong>Planning:</strong> Envisioning a structure and determining steps to create it</li>
        <li><strong>Working memory:</strong> Holding a mental model while building</li>
        <li><strong>Cognitive flexibility:</strong> Adapting when initial approaches don't work</li>
        <li><strong>Inhibitory control:</strong> Carefully placing pieces without knocking structures over</li>
      </ul>
      
      <h3>Persistence and Growth Mindset</h3>
      
      <p>When towers topple or pieces don't fit, construction play naturally teaches children to view failures as temporary setbacks rather than permanent limitations. This resilience and willingness to try different approaches forms the foundation of a growth mindset.</p>
      
      <h2>Types of Construction Toys and Their Benefits</h2>
      
      <h3>Basic Building Blocks</h3>
      
      <p>Wooden unit blocks and similar systems offer completely open-ended possibilities. Their simplicity encourages creativity while teaching fundamental physics concepts like gravity, balance, and structural integrity.</p>
      
      <h3>Interlocking Brick Systems</h3>
      
      <p>Systems like LEGO® and similar products combine open-ended creativity with the ability to create more stable structures. These systems particularly develop:</p>
      
      <ul>
        <li>Fine motor skills and hand-eye coordination</li>
        <li>Following sequential instructions</li>
        <li>Pattern recognition</li>
        <li>Modular thinking</li>
      </ul>
      
      <h3>Construction Sets with Moving Parts</h3>
      
      <p>Sets featuring gears, pulleys, levers, and other mechanical elements introduce engineering concepts and simple machines. These toys help children understand:</p>
      
      <ul>
        <li>Cause and effect relationships</li>
        <li>Transfer of force and motion</li>
        <li>Mechanical advantage</li>
        <li>Engineering design process</li>
      </ul>
      
      <h3>Architectural Building Sets</h3>
      
      <p>More sophisticated sets that allow children to recreate landmarks or design buildings develop:</p>
      
      <ul>
        <li>Attention to detail</li>
        <li>Understanding of scale and proportion</li>
        <li>Appreciation for design and architecture</li>
        <li>Historical and cultural awareness</li>
      </ul>
      
      <h2>Social Dimensions of Construction Play</h2>
      
      <p>While often perceived as solitary, construction play frequently involves rich social interaction:</p>
      
      <h3>Collaborative Building</h3>
      
      <p>When children build together, they practice essential collaboration skills:</p>
      
      <ul>
        <li>Communicating ideas clearly</li>
        <li>Negotiating shared goals</li>
        <li>Dividing tasks effectively</li>
        <li>Giving and receiving feedback</li>
      </ul>
      
      <h3>Storytelling Through Construction</h3>
      
      <p>Many children naturally incorporate narrative elements into their construction play, creating scenarios and characters that inhabit their built environments. This integration of construction and dramatic play supports language development and narrative thinking.</p>
      
      <h2>Supporting Construction Play Across Ages</h2>
      
      <h3>Ages 1-2</h3>
      
      <p>Focus on large, stable blocks that are easy to grasp and stack. At this stage, the joy is in the process—building up and knocking down—rather than creating lasting structures.</p>
      
      <h3>Ages 3-5</h3>
      
      <p>Introduce varied shapes and interlocking systems. Children begin creating representational structures ("This is a house") and incorporating blocks into dramatic play scenarios.</p>
      
      <h3>Ages 6-8</h3>
      
      <p>Children become interested in more complex systems, following instructions, and creating specific designs. Their fine motor skills can handle smaller pieces and more intricate connections.</p>
      
      <h3>Ages 9-12</h3>
      
      <p>Advanced builders enjoy technical challenges, motorized elements, and increasingly complex architectural and engineering projects. Construction toys can now connect to real-world interests in science, design, and engineering.</p>
      
      <h2>Digital and Physical Integration</h2>
      
      <p>Modern construction toys often bridge the physical and digital worlds:</p>
      
      <ul>
        <li>Augmented reality apps that interact with physical constructions</li>
        <li>Programming interfaces that allow children to code behaviors for their built creations</li>
        <li>Design software that helps plan complex structures before building</li>
      </ul>
      
      <p>These hybrid approaches combine the cognitive benefits of hands-on building with digital literacy skills increasingly important in modern environments.</p>
      
      <h2>Conclusion</h2>
      
      <p>Construction toys provide some of the richest learning opportunities available in childhood. By supporting construction play with appropriate materials, adequate time, and respectful engagement with children's creations, parents and educators nurture not just future architects and engineers, but creative problem-solvers ready for whatever challenges they may face.</p>
    `,
  },
];

export default function BlogPost() {
  const { t } = useTranslation();
  const params = useParams();
  const { id } = params;

  // Find the blog post with the matching ID
  const post = blogPosts.find((post) => post.id === id);

  // If no post is found, return 404
  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/70 via-purple-900/60 to-pink-900/70" />
        </div>
        <div className="container relative z-10 text-white px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-white/90 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToBlog")}
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md max-w-4xl">
            {post.title}
          </h1>
          <div className="flex flex-wrap gap-4 items-center text-white/90">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              <span>{post.category}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-12 bg-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div
              className="prose prose-lg prose-indigo max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-indigo-900 mb-4">
                About the Author
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900">
                    {post.author}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Expert in early childhood education and STEM learning.
                    Passionate about making complex concepts accessible to young
                    minds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-12 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-indigo-900">
            {t("relatedArticles")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts
              .filter((relatedPost) => relatedPost.id !== post.id)
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
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                      className="transition-transform hover:scale-105 duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium shadow-sm border border-indigo-200/50">
                        {relatedPost.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex justify-between items-center">
                      <span className="text-xs text-indigo-600 font-medium">
                        {relatedPost.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-indigo-900 line-clamp-2 hover:text-indigo-700 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-indigo-600 font-medium">
                        By {relatedPost.author}
                      </span>
                      <Button
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 shadow-sm transition-all"
                        size="sm"
                        asChild>
                        <Link href={`/blog/${relatedPost.id}`}>
                          {t("readMore")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-8 text-center">
            <Button
              className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white border-none shadow-md transition-all"
              asChild>
              <Link href="/blog">{t("viewAllArticles")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
