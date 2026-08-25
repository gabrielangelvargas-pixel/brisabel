ALTER TABLE `Usuario`
  ADD COLUMN `dni` VARCHAR(20) NOT NULL,
  MODIFY `email` VARCHAR(160) NULL;

CREATE UNIQUE INDEX `Usuario_dni_key` ON `Usuario`(`dni`);
