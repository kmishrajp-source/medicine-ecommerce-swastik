const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const blogs = [
    {
      title: "5 Essential Health Tips for Gorakhpur Residents",
      slug: "5-essential-health-tips-gorakhpur",
      content: "Gorakhpur's climate can be challenging. Here are 5 tips to stay healthy:\n1. Drink purified water.\n2. Protect yourself from mosquitoes.\n3. Eat seasonal fruits.\n4. Exercise regularly at Vindhyavasini Park.\n5. Get regular checkups at Swastik Medicare.",
      metaTitle: "5 Best Health Tips for Gorakhpur | Swastik Medicare",
      metaDescription: "Stay healthy in Gorakhpur with these 5 essential tips. From water purification to local exercise spots, we cover it all.",
      category: "Health Tips",
      featuredImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Understanding Dengue: Prevention and Cure",
      slug: "understanding-dengue-prevention-cure",
      content: "Dengue is common in monsoon. Learn about the symptoms, prevention, and how to find the best doctors in Gorakhpur for treatment.",
      metaTitle: "Dengue Prevention & Cure Guide | Swastik Medicare",
      metaDescription: "A comprehensive guide to Dengue fever, its symptoms, and effective prevention strategies for the Gorakhpur community.",
      category: "Disease Guides",
      featuredImage: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Best Pediatricians in Gorakhpur: A Complete Guide",
      slug: "best-pediatricians-gorakhpur-guide",
      content: "Looking for the best child specialist? We've compiled a list of top-rated pediatricians in areas like Betiahata, Golghar, and Gorakhnath.",
      metaTitle: "Top 10 Pediatricians in Gorakhpur | Best Child Doctors",
      metaDescription: "Find the best pediatrician for your child in Gorakhpur. Verified list of child specialists with contact details and reviews.",
      category: "Doctor Guides",
      featuredImage: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=800&q=80"
    }
  ];

  for (const blog of blogs) {
    await prisma.blogPost.upsert({
      where: { slug: blog.slug },
      update: blog,
      create: blog,
    });
  }

  console.log("Seeded 3 blog posts.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
