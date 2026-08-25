-- RenameTable
RENAME TABLE `User` TO `Usuario`;

-- AlterTable
ALTER TABLE `Usuario`
  MODIFY `id` VARCHAR(40) NOT NULL,
  CHANGE `name` `nombre` VARCHAR(120) NOT NULL,
  MODIFY `email` VARCHAR(160) NOT NULL,
  CHANGE `role` `rol` ENUM('ADMIN', 'OPERADOR') NOT NULL DEFAULT 'ADMIN',
  ADD COLUMN `passwordHash` VARCHAR(255) NOT NULL,
  ADD COLUMN `activo` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `SesionUsuario` (
    `id` VARCHAR(40) NOT NULL,
    `tokenHash` VARCHAR(64) NOT NULL,
    `usuarioId` VARCHAR(40) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SesionUsuario_tokenHash_key`(`tokenHash`),
    INDEX `SesionUsuario_usuarioId_idx`(`usuarioId`),
    INDEX `SesionUsuario_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SesionUsuario` ADD CONSTRAINT `SesionUsuario_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
