-- AlterTable
ALTER TABLE `Categoria` ADD COLUMN `orden` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `Categoria_parentId_orden_idx` ON `Categoria`(`parentId`, `orden`);
