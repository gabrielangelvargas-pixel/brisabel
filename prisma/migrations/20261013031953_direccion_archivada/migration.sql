-- Direcciones archivadas (editadas o borradas por el usuario pero usadas en
-- pedidos). El índice nuevo reemplaza al anterior; como ese índice lo usa la
-- clave foránea a Usuario, se quita la FK y se vuelve a crear igual.
-- (Corregido a mano: el diff de Prisma recreaba la FK sobre la tabla Sesion.)

-- DropForeignKey
ALTER TABLE `Direccion` DROP FOREIGN KEY `Direccion_usuarioId_fkey`;

-- DropIndex
DROP INDEX `Direccion_usuarioId_modificado_idx` ON `Direccion`;

-- AlterTable
ALTER TABLE `Direccion` ADD COLUMN `archivada` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Direccion_usuarioId_archivada_modificado_idx` ON `Direccion`(`usuarioId`, `archivada`, `modificado`);

-- AddForeignKey
ALTER TABLE `Direccion` ADD CONSTRAINT `Direccion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
