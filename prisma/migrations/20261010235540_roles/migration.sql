-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `rolId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Rol` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(30) NOT NULL,
    `nombre` VARCHAR(60) NOT NULL,

    UNIQUE INDEX `Rol_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Roles base
INSERT INTO `Rol` (`codigo`, `nombre`) VALUES
    ('ADMIN', 'Administrador'),
    ('CLIENTE', 'Cliente');

-- CreateIndex
CREATE INDEX `Usuario_rolId_idx` ON `Usuario`(`rolId`);

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
