-- CreateTable
CREATE TABLE `Portada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ocasion` VARCHAR(40) NOT NULL,
    `frase` VARCHAR(120) NULL,
    `imagen` VARCHAR(120) NOT NULL,
    `enlace` VARCHAR(200) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `creado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modificado` DATETIME(3) NOT NULL,

    INDEX `Portada_activa_orden_idx`(`activa`, `orden`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
