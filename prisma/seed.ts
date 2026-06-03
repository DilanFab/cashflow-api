import { PrismaClient, TransactionType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.create({
    data: {
      email: 'dilan@test.com',
      name: 'Dilan',
    },
  });

  const categories = [
    { name: 'Indriver',                  type: TransactionType.INCOME },
    { name: 'EasyCar',  type: TransactionType.INCOME },
    { name: 'Freelance',             type: TransactionType.INCOME },
    { name: 'Gasolina',              type: TransactionType.EXPENSE },
    { name: 'Alimentación',          type: TransactionType.EXPENSE },
    { name: 'Arriendo',              type: TransactionType.EXPENSE },
    { name: 'Servicios',             type: TransactionType.EXPENSE },
    { name: 'Mantenimiento',         type: TransactionType.EXPENSE },
  ];

  await prisma.category.createMany({ data: categories });

  console.log('Seed completado. Usuario:', user.email);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
