import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const limit = parseInt(searchParams.get("limit") || "10");

        const where = category ? { category } : {};

        const posts = await prisma.blogPost.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                author: {
                    select: { name: true }
                }
            }
        });

        return NextResponse.json({ success: true, posts });
    } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch blog posts" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { title, content, slug, metaTitle, metaDescription, featuredImage, category, authorId } = body;

        if (!title || !content || !slug) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const post = await prisma.blogPost.create({
            data: {
                title,
                content,
                slug,
                metaTitle,
                metaDescription,
                featuredImage,
                category,
                authorId
            }
        });

        return NextResponse.json({ success: true, post });
    } catch (error) {
        console.error("Failed to create blog post:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 400 });
        }
        return NextResponse.json({ success: false, error: "Failed to create blog post" }, { status: 500 });
    }
}
