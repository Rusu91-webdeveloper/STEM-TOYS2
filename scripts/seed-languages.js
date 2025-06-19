const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const defaultLanguages = [
  {
    name: "English",
    code: "en",
    nativeName: "English",
    isAvailable: true,
  },
  {
    name: "Romanian",
    code: "ro",
    nativeName: "Română",
    isAvailable: true,
  },
  {
    name: "Spanish",
    code: "es",
    nativeName: "Español",
    isAvailable: true,
  },
  {
    name: "French",
    code: "fr",
    nativeName: "Français",
    isAvailable: true,
  },
  {
    name: "German",
    code: "de",
    nativeName: "Deutsch",
    isAvailable: true,
  },
  {
    name: "Italian",
    code: "it",
    nativeName: "Italiano",
    isAvailable: true,
  },
];

async function seedLanguages() {
  console.log("🌐 Starting language seeding...");

  try {
    // Check if languages already exist
    const existingLanguages = await prisma.language.findMany();

    if (existingLanguages.length > 0) {
      console.log(
        `✅ Found ${existingLanguages.length} existing languages. Skipping seed.`
      );
      console.log(
        "Existing languages:",
        existingLanguages.map((l) => `${l.name} (${l.code})`).join(", ")
      );
      return;
    }

    console.log("📝 Creating default languages...");

    // Create languages
    const createdLanguages = await Promise.all(
      defaultLanguages.map(async (language) => {
        return await prisma.language.create({
          data: language,
        });
      })
    );

    console.log(
      `✅ Successfully created ${createdLanguages.length} languages:`
    );
    createdLanguages.forEach((lang) => {
      console.log(`   - ${lang.name} (${lang.code}) - ${lang.nativeName}`);
    });

    console.log("🎉 Language seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding languages:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedLanguages()
    .then(() => {
      console.log("✨ Language seeding process finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Language seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedLanguages };
