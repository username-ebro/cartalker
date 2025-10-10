/**
 * Clean Wrangler Data Script
 *
 * Deletes all data (maintenance, issues, documents, etc.) associated with the Jeep Wrangler
 * while keeping the vehicle record itself.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanWranglerData() {
  console.log('🔍 Finding Jeep Wrangler...\n');

  // Find the Wrangler
  const wrangler = await prisma.vehicle.findFirst({
    where: {
      OR: [
        { make: { contains: 'Jeep' } },
        { model: { contains: 'Wrangler' } },
        { nickname: { contains: 'Wrangler' } }
      ]
    },
    include: {
      _count: {
        select: {
          maintenanceRecords: true,
          issues: true,
          documents: true,
          chatConversations: true,
          serviceReminders: true,
          importedReports: true
        }
      }
    }
  });

  if (!wrangler) {
    console.log('❌ No Jeep Wrangler found in database');
    return;
  }

  console.log(`✅ Found Wrangler:`);
  console.log(`   Vehicle ID: ${wrangler.id}`);
  console.log(`   VIN: ${wrangler.vin}`);
  console.log(`   Year: ${wrangler.year}`);
  console.log(`   Make: ${wrangler.make}`);
  console.log(`   Model: ${wrangler.model}`);
  console.log(`   Nickname: ${wrangler.nickname || 'N/A'}\n`);

  console.log(`📊 Current Data Count:`);
  console.log(`   Maintenance Records: ${wrangler._count.maintenanceRecords}`);
  console.log(`   Issues: ${wrangler._count.issues}`);
  console.log(`   Documents: ${wrangler._count.documents}`);
  console.log(`   Chat Conversations: ${wrangler._count.chatConversations}`);
  console.log(`   Service Reminders: ${wrangler._count.serviceReminders}`);
  console.log(`   Imported Reports: ${wrangler._count.importedReports}\n`);

  const totalRecords =
    wrangler._count.maintenanceRecords +
    wrangler._count.issues +
    wrangler._count.documents +
    wrangler._count.chatConversations +
    wrangler._count.serviceReminders +
    wrangler._count.importedReports;

  if (totalRecords === 0) {
    console.log('✅ No data to clean - Wrangler is already clean!');
    return;
  }

  console.log(`🗑️  Deleting ${totalRecords} total records...\n`);

  // Delete all associated data
  const results = await prisma.$transaction([
    // Delete maintenance records
    prisma.maintenanceRecord.deleteMany({
      where: { vehicleId: wrangler.id }
    }),

    // Delete issues
    prisma.issue.deleteMany({
      where: { vehicleId: wrangler.id }
    }),

    // Delete documents
    prisma.document.deleteMany({
      where: { vehicleId: wrangler.id }
    }),

    // Delete chat conversations (and their messages via cascade)
    prisma.chatConversation.deleteMany({
      where: { vehicleId: wrangler.id }
    }),

    // Delete service reminders
    prisma.serviceReminder.deleteMany({
      where: { vehicleId: wrangler.id }
    }),

    // Delete imported reports
    prisma.importedReport.deleteMany({
      where: { vehicleId: wrangler.id }
    })
  ]);

  console.log(`✅ Deletion Complete:\n`);
  console.log(`   Maintenance Records: ${results[0].count} deleted`);
  console.log(`   Issues: ${results[1].count} deleted`);
  console.log(`   Documents: ${results[2].count} deleted`);
  console.log(`   Chat Conversations: ${results[3].count} deleted`);
  console.log(`   Service Reminders: ${results[4].count} deleted`);
  console.log(`   Imported Reports: ${results[5].count} deleted\n`);

  console.log(`🎉 Wrangler data cleaned successfully!`);
  console.log(`   Vehicle record preserved`);
}

cleanWranglerData()
  .catch((error) => {
    console.error('❌ Error cleaning Wrangler data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
