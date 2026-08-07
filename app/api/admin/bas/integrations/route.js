import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { AIService } from '../../../../../utils/bas/ai-service';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const configs = await prisma.basIntegrationConfig.findMany();
    
    // Fallback: If no records exist, return some mock configurations
    const defaultConfigs = [
      { key: 'ERP_CONNECTOR', name: 'ERP Sync (Tally/Zoho Books)', value: { enabled: false, endpoint: '' } },
      { key: 'AI_SERVICE', name: 'AI Forecasting Engine', value: { enabled: false } },
      { key: 'LOGISTICS_PARTNER', name: 'Logistics Partner API (Shiprocket)', value: { enabled: false } }
    ];

    const mappedConfigs = defaultConfigs.map(def => {
      const match = configs.find(c => c.key === def.key);
      return match ? match : def;
    });

    // Fetch AI recommendations from service
    const aiRecs = await AIService.getMarketingRecommendations();

    return NextResponse.json({
      integrations: mappedConfigs,
      aiRecommendations: aiRecs
    });
  } catch (error) {
    console.error('Error fetching integrations config:', error);
    return NextResponse.json({ error: 'Failed to fetch configs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { key, name, value } = data;

    if (!key || !name) {
      return NextResponse.json({ error: 'key and name are required' }, { status: 400 });
    }

    const config = await prisma.basIntegrationConfig.upsert({
      where: { key },
      update: { value },
      create: { key, name, value }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}
