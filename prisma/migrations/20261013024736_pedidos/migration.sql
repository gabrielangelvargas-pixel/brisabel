-- CreateTable
CREATE TABLE `Pedido` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` VARCHAR(30) NOT NULL,
    `estado` ENUM('PENDIENTE', 'CONFIRMADO', 'ENTREGADO', 'CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
    `nombre` VARCHAR(120) NOT NULL,
    `telefono` VARCHAR(30) NOT NULL,
    `entrega` ENUM('RETIRO', 'ENVIO') NOT NULL,
    `direccion` VARCHAR(200) NULL,
    `localidad` VARCHAR(100) NULL,
    `notas` VARCHAR(500) NULL,
    `total` DECIMAL(12, 2) NOT NULL,
    `creado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modificado` DATETIME(3) NOT NULL,

    INDEX `Pedido_usuarioId_creado_idx`(`usuarioId`, `creado`),
    INDEX `Pedido_estado_creado_idx`(`estado`, `creado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PedidoItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pedidoId` INTEGER NOT NULL,
    `productoId` INTEGER NULL,
    `sku` VARCHAR(40) NOT NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `variante` VARCHAR(130) NULL,
    `precio` DECIMAL(12, 2) NOT NULL,
    `cantidad` INTEGER NOT NULL,

    INDEX `PedidoItem_pedidoId_idx`(`pedidoId`),
    INDEX `PedidoItem_productoId_idx`(`productoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pedido` ADD CONSTRAINT `Pedido_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoItem` ADD CONSTRAINT `PedidoItem_pedidoId_fkey` FOREIGN KEY (`pedidoId`) REFERENCES `Pedido`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoItem` ADD CONSTRAINT `PedidoItem_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `Producto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
