// Script to add a Romanian version of an existing blog post
const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  try {
    // First, get an English blog post to translate
    const englishBlog = await prisma.blog.findFirst({
      where: {
        slug: "coding-for-kids-programming-skills-digital-age",
      },
    });

    if (!englishBlog) {
      console.log("English blog post not found");
      return;
    }

    console.log(`Found English blog post: ${englishBlog.title}`);

    // Create a Romanian version with -ro suffix in slug
    const romanianBlogData = {
      title:
        "Programarea pentru Copii: Dezvoltarea Abilităților de Programare în Era Digitală",
      slug: "coding-for-kids-programming-skills-digital-age-ro",
      excerpt:
        "Cum jucăriile de programare și activitățile STEM ajută copiii să dobândească abilități esențiale pentru viitorul digital.",
      content: `Într-o lume din ce în ce mai digitalizată, abilitățile de programare au devenit la fel de fundamentale precum cititul și matematica. Copiii de astăzi cresc înconjurați de tehnologie și vor intra într-o forță de muncă unde competențele digitale sunt esențiale. Jucăriile educaționale de programare oferă o modalitate distractivă și accesibilă pentru cei mici să dezvolte aceste abilități cruciale.

## De ce este importantă programarea pentru copii

Programarea nu înseamnă doar scrierea de cod. Este un mod de gândire care implică rezolvarea problemelor, gândirea logică și creativitatea. Când copiii învață să programeze:

- Dezvoltă gândire algoritmică și capacități de rezolvare a problemelor
- Îmbunătățesc abilități matematice și logice într-un context practic
- Își cultivă răbdarea și perseverența
- Capătă încredere în abilitățile lor tehnice
- Se pregătesc pentru oportunitățile viitoare de carieră

## Cum să introduci programarea pentru copiii tăi

### 1. Roboți programabili și jucării STEM

Roboții educaționali cum ar fi Botley sau Dash sunt intrări excelente în programare pentru copiii de la 4 ani în sus. Aceste jucării permit copiilor să programeze secvențe de mișcări prin intermediul unor interfețe simple, fizice, fără a necesita dispozitive cu ecran.

### 2. Aplicații și jocuri de programare

Aplicații precum Scratch Jr (pentru 5-7 ani) sau Scratch (8+ ani) oferă un mediu de programare vizual unde copiii pot crea povești interactive și jocuri prin tragerea și plasarea blocurilor de cod.

### 3. Kituri de construcție cu componente programabile

Seturi precum LEGO BOOST sau littleBits combinată construcția cu programarea, permițând copiilor să construiască și să programeze creațiile lor proprii.

### 4. Cărți și activități offline

Nu toate activitățile de programare necesită ecrane sau dispozitive electronice. Cărțile care introduc concepte de codare și jocuri de masă despre programare pot fi resurse valoroase.

## Beneficiile în viața reală

Expunerea timpurie la concepte de programare are beneficii care se extind dincolo de abilități tehnice:

- **Rezolvarea creativă a problemelor**: Copiii învață să abordeze provocările din multiple perspective
- **Colaborare**: Multe activități de programare încurajează lucrul în echipă
- **Alfabetizare digitală**: Înțelegerea modului în care funcționează tehnologia îi transformă din consumatori pasivi în creatori activi
- **Pregătire pentru viitor**: Dezvoltarea unei mentalități orientate spre tehnologie îi pregătește pentru cariere care încă nu există

## Concluzie

Incorporarea jucăriilor și activităților de programare în rutina copiilor tăi nu înseamnă neapărat că îi pregătești pentru o carieră în IT. Este vorba despre dezvoltarea unei mentalități orientate spre rezolvarea problemelor și înzestrarea lor cu abilități care vor fi valoroase indiferent de calea pe care o vor alege. Începe devreme, menține experiența distractivă și permite-le să exploreze și să creeze în propriul lor ritm.`,
      coverImage: englishBlog.coverImage,
      categoryId: englishBlog.categoryId,
      authorId: englishBlog.authorId,
      stemCategory: englishBlog.stemCategory,
      tags: ["programare", "copii", "STEM", "educație", "tehnologie"],
      isPublished: true,
      publishedAt: new Date(),
      readingTime: Math.ceil(900 / 200), // Approximation based on Romanian words
      metadata: {
        language: "ro",
        translatedFrom: englishBlog.id,
        originalLanguage: "en",
      },
    };

    // Create the Romanian blog post
    const romanianBlog = await prisma.blog.create({
      data: romanianBlogData,
    });

    console.log("Created Romanian blog post:");
    console.log(`Title: ${romanianBlog.title}`);
    console.log(`Slug: ${romanianBlog.slug}`);
    console.log(`ID: ${romanianBlog.id}`);

    // Also update the English blog post to reference the Romanian version
    await prisma.blog.update({
      where: { id: englishBlog.id },
      data: {
        metadata: {
          language: "en",
          hasTranslation: {
            ro: romanianBlog.id,
          },
        },
      },
    });

    console.log("Updated English blog post with translation reference");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
