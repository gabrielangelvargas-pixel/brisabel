-- CreateTable
CREATE TABLE `SuscripcionPush` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` VARCHAR(30) NOT NULL,
    `endpoint` VARCHAR(512) NOT NULL,
    `p256dh` VARCHAR(200) NOT NULL,
    `auth` VARCHAR(100) NOT NULL,
    `creado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modificado` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SuscripcionPush_endpoint_key`(`endpoint`),
    INDEX `SuscripcionPush_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SuscripcionPush` ADD CONSTRAINT `SuscripcionPush_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
