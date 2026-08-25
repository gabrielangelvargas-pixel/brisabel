-- DropForeignKey
ALTER TABLE `Producto` DROP FOREIGN KEY `Producto_categoriaId_fkey`;

-- DropForeignKey
ALTER TABLE `Categoria` DROP FOREIGN KEY `Categoria_parentId_fkey`;

-- AlterTable
ALTER TABLE `Categoria` MODIFY `id` VARCHAR(40) NOT NULL;

-- AlterTable
ALTER TABLE `Categoria` MODIFY `parentId` VARCHAR(40) NULL;

-- AlterTable
ALTER TABLE `Producto` MODIFY `categoriaId` VARCHAR(40) NOT NULL;

-- AddForeignKey
ALTER TABLE `Categoria` ADD CONSTRAINT `Categoria_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Categoria`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
