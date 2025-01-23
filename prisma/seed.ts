import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 创建用户
  const user = await prisma.user.create({
    data: {
      email: 'testuser@example.com',
      name: 'Test User',
    },
  });

  console.log('User created:', user);

  // 创建一级类目
  const category1 = await prisma.category1.create({
    data: {
      name: 'Category1 Name',
    },
  });

  console.log('Category1 created:', category1);

  // 创建项目
  const project = await prisma.project.create({
    data: {
      name: 'Project Name',
    },
  });

  console.log('Project created:', project);

  // 创建 SVN 分支
  const svnBranch = await prisma.svnBranch.create({
    data: {
      name: 'Main Branch',
      remark: 'This is a main branch',
      createdBy: 'Admin',
      projectId: project.id,
    },
  });

  console.log('SVN Branch created:', svnBranch);

  // 创建文本配置
  const textConfig = await prisma.textConfig.create({
    data: {
      svnBranchId: svnBranch.id,
      category1: 'Category1 Name',
      category2: 'Subcategory1 Name',
      startId: 1,
      endId: 100,
      createdBy: 'Admin',
    },
  });

  console.log('TextConfig created:', textConfig);

  // 创建文本内容
  const textContent = await prisma.textContent.create({
    data: {
      configId: textConfig.id,
      textId: 1,
      paramCount: 2,
      contentCn: '简体中文内容',
      contentEn: 'English Content',
      contentJa: '日本語の内容',
      remark: 'Test remark',
    },
  });

  console.log('TextContent created:', textContent);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
