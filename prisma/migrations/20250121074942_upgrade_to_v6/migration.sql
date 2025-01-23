-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `token` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category1` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Category1_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SvnBranch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `remark` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TextConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `svnBranchId` INTEGER NOT NULL,
    `category1` VARCHAR(191) NOT NULL,
    `category2` VARCHAR(191) NOT NULL,
    `startId` INTEGER NOT NULL,
    `endId` INTEGER NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TextConfig_svnBranchId_category1_category2_key`(`svnBranchId`, `category1`, `category2`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TextContent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `configId` INTEGER NOT NULL,
    `textId` INTEGER NOT NULL,
    `paramCount` INTEGER NOT NULL,
    `contentCn` VARCHAR(191) NOT NULL,
    `contentTw` VARCHAR(191) NULL,
    `contentEn` VARCHAR(191) NULL,
    `contentJa` VARCHAR(191) NULL,
    `contentKo` VARCHAR(191) NULL,
    `contentVi` VARCHAR(191) NULL,
    `contentRu` VARCHAR(191) NULL,
    `contentIt` VARCHAR(191) NULL,
    `contentEs` VARCHAR(191) NULL,
    `contentPt` VARCHAR(191) NULL,
    `contentFr` VARCHAR(191) NULL,
    `contentAr` VARCHAR(191) NULL,
    `contentDe` VARCHAR(191) NULL,
    `contentTh` VARCHAR(191) NULL,
    `contentId` VARCHAR(191) NULL,
    `contentTr` VARCHAR(191) NULL,
    `contentSeaEn` VARCHAR(191) NULL,
    `remark` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SvnBranch` ADD CONSTRAINT `SvnBranch_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TextConfig` ADD CONSTRAINT `TextConfig_svnBranchId_fkey` FOREIGN KEY (`svnBranchId`) REFERENCES `SvnBranch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TextContent` ADD CONSTRAINT `TextContent_configId_fkey` FOREIGN KEY (`configId`) REFERENCES `TextConfig`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
