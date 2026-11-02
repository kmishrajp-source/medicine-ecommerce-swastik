const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function testQuery() {
  try {
    const doctors = await prisma.doctor.findMany({ take: 20, orderBy: { rating: 'desc' } });
    console.log('Doctors query succeeded, count:', doctors.length);
  } catch (e) {
    console.error('Doctor query error:', e.message);
  }

  try {
    const retailers = await prisma.retailer.findMany({ take: 20, orderBy: { shopName: 'asc' } });
    console.log('Retailers query succeeded, count:', retailers.length);
  } catch (e) {
    console.error('Retailer query error:', e.message);
  }

  try {
    const labs = await prisma.lab.findMany({ take: 20, orderBy: { name: 'asc' } });
    console.log('Lab query succeeded, count:', labs.length);
  } catch (e) {
    console.error('Lab query error:', e.message);
  }

  try {
    const hospitals = await prisma.hospital.findMany({ take: 20, orderBy: { name: 'asc' } });
    console.log('Hospital query succeeded, count:', hospitals.length);
  } catch (e) {
    console.error('Hospital query error:', e.message);
  }

  try {
    const ambulances = await prisma.ambulance.findMany({ take: 20, orderBy: { driverName: 'asc' } });
    console.log('Ambulance query succeeded, count:', ambulances.length);
  } catch (e) {
    console.error('Ambulance query error:', e.message);
  }

  await prisma.$disconnect();
}
testQuery();

