import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const roles = await prisma.basRole.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching BAS roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newRole = await prisma.basRole.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error('Error creating BAS role:', error);
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}
