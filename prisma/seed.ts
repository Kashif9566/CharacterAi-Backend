import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash the admin password
  const hashedPassword = await bcrypt.hash('WY6Fp?4H', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'kashif.saeed@codefinitysol.com' },
    update: {},
    create: {
      email: 'kashif.saeed@codefinitysol.com',
      name: 'Kashif Saeed',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log('✅ Admin user created:', {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });