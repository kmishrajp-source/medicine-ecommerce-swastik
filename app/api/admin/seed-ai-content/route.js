import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const blogs = [
    {
      title: "Heart Health: 10 Tips for a Stronger Cardiovascular System",
      slug: "heart-health-tips-strong-cardiovascular",
      content: `## Prioritizing Your Heart Health in Gorakhpur

Heart disease remains one of the leading health challenges globally, but many risks can be managed with lifestyle changes. Here are 10 expert tips:

1. **Regular Cardio**: Aim for at least 30 minutes of brisk walking. Vindhyavasini Park or Lohia Park are great spots for a morning walk in Gorakhpur.
2. **Heart-Healthy Diet**: Reduce processed salt and saturated fats. Incorporate more green leafy vegetables.
3. **Monitor Blood Pressure**: High BP is a silent killer. Get it checked regularly at Swastik Medicare.
4. **Manage Stress**: Practice yoga or meditation to keep your heart rhythm stable.
5. **Quit Smoking**: Tobacco use significantly increases the risk of heart attacks.
6. **Watch Your Weight**: Maintaining a healthy BMI reduces the strain on your heart.
7. **Limit Alcohol**: Excessive drinking can lead to high blood pressure and heart failure.
8. **Sleep Well**: 7-8 hours of quality sleep is essential for heart recovery.
9. **Regular Health Screenings**: Early detection of cholesterol or glucose issues can save lives.
10. **Consult Specialists**: If you have a family history, consult with top cardiologists in Betiahata or Golghar via Swastik Medicare.

**Need a heart checkup?** [Find a Cardiologist Now](/en/doctors?specialization=Cardiologist)`,
      metaTitle: "Heart Health Tips & Best Cardiologists in Gorakhpur | Swastik Medicare",
      metaDescription: "Learn 10 essential tips for heart health and connect with top-rated cardiologists in Gorakhpur for expert care.",
      category: "Heart Health",
      featuredImage: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Managing Diabetes: A Comprehensive Guide for Gorakhpur Residents",
      slug: "managing-diabetes-comprehensive-guide-gorakhpur",
      content: `## Living Well with Diabetes

Diabetes management is about balance—balancing your food, activity, and medicine.

### Key Management Strategies:
* **HBA1C Monitoring**: This test gives your 3-month average blood sugar. It's the gold standard for management.
* **Foot Care**: Diabetics should check their feet daily for any minor injuries.
* **Carb Counting**: Understand how different foods affect your glucose levels.
* **Regular Exercise**: Muscles use glucose for energy, even when you're not moving.

### Where to get help in Gorakhpur?
* **Pathology Labs**: Get accurate glucose and HBA1C tests at verified labs listed on Swastik Medicare.
* **Specialists**: Gorakhpur has excellent Diabetologists and Endocrinologists in areas like Medical College Road.

**Search for Diabetes Medicines:** [Shop Pharmacy](/en/shop)`,
      metaTitle: "Diabetes Management Guide Gorakhpur | Blood Sugar Tips",
      metaDescription: "A complete guide to managing Type 1 and Type 2 diabetes for residents of Gorakhpur. Tips, diet, and local specialist info.",
      category: "Diabetes",
      featuredImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Understanding Thyroid Disorders: Hypo vs Hyperthyroidism",
      slug: "thyroid-disorders-hypo-hyper-guide",
      content: `## Is it your Thyroid?

Many people suffer from fatigue, weight changes, and mood swings without realizing the thyroid gland is responsible.

### Hypothyroidism (Underactive)
* **Symptoms**: Fatigue, cold intolerance, weight gain, dry skin.
* **Treatment**: Usually managed with daily hormone replacement (Levothyroxine).

### Hyperthyroidism (Overactive)
* **Symptoms**: Anxiety, weight loss, heat intolerance, rapid heartbeat.
* **Treatment**: Medicines to slow down the thyroid or radioactive iodine.

### Diagnosis
A simple **TSH (Thyroid Stimulating Hormone)** blood test is the first step. You can book home sample collection via Swastik Medicare.

**Book a Thyroid Test:** [Visit Labs Section](/en/labs)`,
      metaTitle: "Thyroid Symptoms & Treatment Guide Gorakhpur | Swastik Medicare",
      metaDescription: "Understand the difference between Hypothyroidism and Hyperthyroidism. Symptoms, diagnosis, and treatment tips for Gorakhpur.",
      category: "Thyroid Health",
      featuredImage: "https://images.unsplash.com/photo-1511174511562-5f7f185854c8?auto=format&fit=crop&w=800&q=80"
    }
  ];

  try {
    const results = [];
    for (const blog of blogs) {
      const res = await prisma.blogPost.upsert({
        where: { slug: blog.slug },
        update: blog,
        create: blog,
      });
      results.push(res);
    }
    return NextResponse.json({ success: true, seeded: results.length });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
