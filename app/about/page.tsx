"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/category_banner_science_01.png"
            alt="About us banner showing children engaging with STEM toys"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/70 via-purple-900/60 to-pink-900/70" />
        </div>
        <div className="container relative z-10 text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-md">
            {t("aboutTitle")}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl leading-relaxed drop-shadow-sm">
            {t("aboutDescription")}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Image
                  src="/TechTots_LOGO.png"
                  alt="TechTots Logo"
                  width={100}
                  height={50}
                  className="mr-4"
                />
                <h2 className="text-3xl font-bold text-indigo-900">
                  {t("ourStory")}
                </h2>
              </div>
              <div className="space-y-4 text-lg text-gray-700">
                <p className="leading-relaxed">
                  TechTots was founded in 2025 after our founder read the
                  groundbreaking book "Born for the Future" by Casey Wrenly. The
                  book's profound insights into child development and future
                  skills inspired our mission to revolutionize educational play.
                </p>
                <p className="leading-relaxed">
                  We deeply understand how critical STEM toys are in shaping our
                  children's future from a young age. These toys don't just
                  entertain—they develop essential neural pathways, foster
                  curiosity, and build the foundation for computational
                  thinking, spatial reasoning, and scientific inquiry.
                </p>
                <p className="leading-relaxed">
                  Our carefully selected products are designed to grow with your
                  child, providing increasingly complex challenges that adapt to
                  their developing capabilities. We believe that by making STEM
                  learning joyful and accessible, we're helping to nurture the
                  innovators, problem-solvers, and creative thinkers of
                  tomorrow.
                </p>
              </div>
            </div>
            <div className="relative h-[450px] rounded-lg overflow-hidden shadow-xl group flex items-center justify-center">
              <div className="absolute inset-0">
                <Image
                  src="/born_for_the_future.png"
                  alt="Born for the Future book cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                  className="transition-transform group-hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              </div>
              <div className="absolute bottom-4 right-4 flex items-center bg-white/80 p-2 rounded-lg shadow-md">
                <Image
                  src="/TechTots_LOGO.png"
                  alt="TechTots Logo"
                  width={40}
                  height={20}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-indigo-900">
                  Inspired our mission
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-indigo-900">
            {t("ourValues")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-all border border-indigo-100 transform hover:-translate-y-1 duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
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
                  className="text-white">
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
              <h3 className="text-xl font-bold mb-4 text-center text-indigo-900">
                {t("qualitySafety")}
              </h3>
              <p className="text-center text-gray-700 leading-relaxed">
                {t("qualitySafetyDesc")}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-all border border-indigo-100 transform hover:-translate-y-1 duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
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
                  className="text-white">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-center text-indigo-900">
                {t("educationalImpact")}
              </h3>
              <p className="text-center text-gray-700 leading-relaxed">
                {t("educationalImpactDesc")}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-all border border-indigo-100 transform hover:-translate-y-1 duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-full flex items-center justify-center mb-6 mx-auto shadow-md">
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
                  className="text-white">
                  <path d="M7 3a4 4 0 0 1 8 0 5 5 0 0 1 4 5.5c0 3-2 4.5-4 5.5C13 16 12 18 12 20m-1-4v-2a4 4 0 0 0-4-4c-2 0-3 1-3 2a3 3 0 0 0 3 3c1 0 3 .5 3 2Z"></path>
                  <path d="M13 20a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-4 text-center text-indigo-900">
                {t("sustainability")}
              </h3>
              <p className="text-center text-gray-700 leading-relaxed">
                {t("sustainabilityDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center text-indigo-900">
            {t("ourTeam")}
          </h2>
          <div className="flex justify-center">
            {/* Rusu Emanuel Marius profile */}
            <div className="bg-white rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border-2 border-indigo-200 transform hover:-translate-y-2 duration-300 max-w-2xl w-full">
              <div className="relative h-80 w-full group">
                <Image
                  src="/images/category_banner_math_01.png"
                  alt="RUSU EMANUEL MARIUS"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                  className="transition-transform group-hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-lg font-medium text-indigo-200 drop-shadow-md">
                    FOUNDER & CEO
                  </p>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4 text-indigo-900 border-b-2 border-indigo-200 pb-2">
                  RUSU EMANUEL MARIUS
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Visionary entrepreneur with extensive expertise in
                  development, design, and marketing. Passionate about creating
                  educational technology that empowers children to explore,
                  learn, and grow. Founded TechTots with the mission to
                  revolutionize how children interact with STEM subjects through
                  thoughtfully designed educational toys.
                </p>
                <div className="mt-6 flex gap-4">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Contact
                  </Button>
                  <Button
                    variant="outline"
                    className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                    LinkedIn
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="container text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 drop-shadow-md">
            {t("joinStemJourney")}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            {t("joinStemJourneyDesc") ||
              "Discover our carefully curated selection of educational toys and start inspiring curiosity today!"}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white hover:bg-white/90 text-indigo-700 border-none shadow-md transition-all hover:shadow-lg">
            <Link href="/products">{t("shopCollection")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
