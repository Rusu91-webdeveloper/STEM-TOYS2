import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://placehold.co/1920x600/3B82F6/FFFFFF.png?text=About+StemToys"
            alt="About us banner showing children engaging with STEM toys"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="container relative z-10 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            About StemToys
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            Empowering the next generation of innovators through play and
            exploration
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-lg">
                <p>
                  Founded in 2020, StemToys began with a simple mission: to make
                  STEM education accessible, engaging, and fun for children of
                  all ages and backgrounds.
                </p>
                <p>
                  We believe that every child deserves the opportunity to
                  develop critical thinking, problem-solving skills, and a love
                  for learning that will serve them throughout their lives.
                </p>
                <p>
                  Our team of educators, designers, and parents work together to
                  curate and develop products that spark curiosity, foster
                  creativity, and build confidence in young learners.
                </p>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="https://placehold.co/800x600/4F46E5/FFFFFF.png?text=Our+Story"
                alt="Children exploring STEM toys"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-muted">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                  />
                  <line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="12"
                  />
                  <line
                    x1="12"
                    y1="16"
                    x2="12.01"
                    y2="16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">
                Quality & Safety
              </h3>
              <p className="text-center">
                We rigorously test all our products to ensure they meet the
                highest standards of quality, durability, and safety for
                children.
              </p>
            </div>
            <div className="bg-background p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">
                Educational Impact
              </h3>
              <p className="text-center">
                Every product in our collection is designed with specific
                learning outcomes in mind, supporting age-appropriate skill
                development.
              </p>
            </div>
            <div className="bg-background p-8 rounded-lg shadow-md">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary">
                  <path d="M7 3a4 4 0 0 1 8 0 5 5 0 0 1 4 5.5c0 3-2 4.5-4 5.5C13 16 12 18 12 20m-1-4v-2a4 4 0 0 0-4-4c-2 0-3 1-3 2a3 3 0 0 0 3 3c1 0 3 .5 3 2Z"></path>
                  <path d="M13 20a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-center">
                Sustainability
              </h3>
              <p className="text-center">
                We're committed to reducing our environmental footprint through
                sustainable materials, responsible packaging, and mindful
                business practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Emily Chen",
                role: "Founder & CEO",
                bio: "Former elementary school teacher with a passion for educational technology.",
                image:
                  "https://placehold.co/400x500/10B981/FFFFFF.png?text=Emily+Chen",
              },
              {
                name: "David Rodriguez",
                role: "Product Development",
                bio: "Child psychologist specializing in cognitive development through play.",
                image:
                  "https://placehold.co/400x500/F59E0B/FFFFFF.png?text=David+Rodriguez",
              },
              {
                name: "Sarah Johnson",
                role: "Educational Director",
                bio: "STEM curriculum specialist with 15 years of experience in education.",
                image:
                  "https://placehold.co/400x500/3B82F6/FFFFFF.png?text=Sarah+Johnson",
              },
              {
                name: "Michael Lee",
                role: "Operations Manager",
                bio: "Logistics expert ensuring quality products and customer satisfaction.",
                image:
                  "https://placehold.co/400x500/EC4899/FFFFFF.png?text=Michael+Lee",
              },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-background border rounded-lg overflow-hidden">
                <div className="relative h-64 w-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our STEM Journey</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover our carefully curated selection of educational toys and
            start inspiring curiosity today!
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary">
            <Link href="/products">Shop Our Collection</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
