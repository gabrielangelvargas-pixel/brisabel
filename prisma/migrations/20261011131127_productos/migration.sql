-- CreateTable
CREATE TABLE `Producto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(170) NOT NULL,
    `precioCosto` DECIMAL(12, 2) NOT NULL,
    `precioVenta` DECIMAL(12, 2) NOT NULL,
    `categoriaId` INTEGER NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `destacado` BOOLEAN NOT NULL DEFAULT false,
    `imagen` VARCHAR(120) NULL,
    `creado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modificado` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Producto_sku_key`(`sku`),
    UNIQUE INDEX `Producto_slug_key`(`slug`),
    INDEX `Producto_categoriaId_activo_idx`(`categoriaId`, `activo`),
    INDEX `Producto_activo_destacado_idx`(`activo`, `destacado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Producto` ADD CONSTRAINT `Producto_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
