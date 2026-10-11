-- CreateTable
CREATE TABLE `Categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(80) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(300) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `parentId` INTEGER NULL,
    `ruta` VARCHAR(255) NOT NULL,
    `nivel` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Categoria_slug_key`(`slug`),
    INDEX `Categoria_parentId_orden_idx`(`parentId`, `orden`),
    INDEX `Categoria_ruta_idx`(`ruta`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Categoria` ADD CONSTRAINT `Categoria_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
