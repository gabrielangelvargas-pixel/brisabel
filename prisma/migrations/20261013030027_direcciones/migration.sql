-- AlterTable
-- localidad pasa a llamarse ciudad (se renombra para conservar los datos).
ALTER TABLE `Pedido` RENAME COLUMN `localidad` TO `ciudad`,
    ADD COLUMN `barrio` VARCHAR(100) NULL,
    ADD COLUMN `direccionId` INTEGER NULL,
    ADD COLUMN `provincia` VARCHAR(60) NULL,
    ADD COLUMN `telefonoTipo` ENUM('CELULAR', 'FIJO') NULL;

-- CreateTable
CREATE TABLE `Direccion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` VARCHAR(30) NOT NULL,
    `calle` VARCHAR(200) NOT NULL,
    `barrio` VARCHAR(100) NOT NULL,
    `ciudad` VARCHAR(100) NOT NULL,
    `provincia` VARCHAR(60) NOT NULL,
    `telefonoTipo` ENUM('CELULAR', 'FIJO') NOT NULL,
    `telefono` VARCHAR(30) NOT NULL,
    `creado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modificado` DATETIME(3) NOT NULL,

    INDEX `Direccion_usuarioId_modificado_idx`(`usuarioId`, `modificado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_direccionId_fkey` FOREIGN KEY (`direccionId`) REFERENCES `Direccion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Direccion` ADD CONSTRAINT `Direccion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
