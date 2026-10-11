-- AlterTable
ALTER TABLE `Producto` ADD COLUMN `modeloId` INTEGER NULL,
    ADD COLUMN `ordenVariante` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `variante` VARCHAR(60) NULL;

-- CreateTable
CREATE TABLE `Modelo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `variacion` VARCHAR(40) NOT NULL,
    `creado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modificado` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Producto_modeloId_idx` ON `Producto`(`modeloId`);

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_modeloId_fkey` FOREIGN KEY (`modeloId`) REFERENCES `Modelo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
