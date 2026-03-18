import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el seeding de la base de datos');

  const userL1 = await prisma.user.upsert({
    where: { email: 'l1@galileo.edu' },
    update: {},
    create: {
      full_name: 'Agente Soporte Nivel 1',
      email: 'l1@galileo.edu',
      password_hash: 'hash_falso_por_ahora',
      role: 'l1_agent', 
    },
  });

  const userL2 = await prisma.user.upsert({
    where: { email: 'l2@galileo.edu' },
    update: {},
    create: {
      full_name: 'Agente Soporte Nivel 2',
      email: 'l2@galileo.edu',
      password_hash: 'hash_falso_por_ahora',
      role: 'l2_agent', 
    },
  });

  console.log(' Usuarios creados exitosamente:');
  console.log(`L1: ${userL1.email} | L2: ${userL2.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });