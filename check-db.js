const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('检查数据库状态...\n');

  // 检查 SystemConfig
  const config = await prisma.systemConfig.findUnique({
    where: { id: 1 }
  });
  console.log('SystemConfig:', config);

  // 检查 Settings
  const settings = await prisma.settings.findUnique({
    where: { id: 1 }
  });
  console.log('\nSettings:', settings);

  // 检查 Records
  const records = await prisma.record.findMany();
  console.log('\nRecords count:', records.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
