import { PrismaClient, TaskStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: passwordHash,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Task 1',
        description: 'Description for Task 1',
        status: TaskStatus.PENDING,
        userId: user.id,
      },
      {
        title: 'Task 2',
        description: 'Description for Task 2',
        status: TaskStatus.IN_PROGRESS,
        userId: user.id,
      },
      {
        title: 'Task 3',
        description: 'Description for Task 3',
        status: TaskStatus.DONE,
        userId: user.id,
      },
    ],
  });

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
