-- DropForeignKey
ALTER TABLE `Pedido` DROP FOREIGN KEY `Pedido_direccionId_fkey`;

-- DropIndex
DROP INDEX `Pedido_direccionId_fkey` ON `Pedido`;

-- AlterTable
ALTER TABLE `Pedido` DROP COLUMN `barrio`,
    DROP COLUMN `ciudad`,
    DROP COLUMN `direccion`,
    DROP COLUMN `provincia`,
    DROP COLUMN `telefonoTipo`,
    MODIFY `telefono` VARCHAR(30) NULL;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_direccionId_fkey` FOREIGN KEY (`direccionId`) REFERENCES `Direccion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
