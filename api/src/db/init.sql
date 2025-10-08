-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema OficiosYA
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema OficiosYA
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `OficiosYA` DEFAULT CHARACTER SET utf8mb4 ;
USE `OficiosYA` ;

-- -----------------------------------------------------
-- Table `OficiosYA`.`rol`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OficiosYA`.`rol` (
  `id_rol` INT NOT NULL AUTO_INCREMENT,
  `nombre` ENUM('Solicitante', 'Prestador', 'Administrador') NOT NULL,
  PRIMARY KEY (`id_rol`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OficiosYA`.`ubicacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OficiosYA`.`ubicacion` (
  `id_ubicacion` INT NOT NULL AUTO_INCREMENT,
  `localidad` VARCHAR(100) NOT NULL,
  `provincia` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_ubicacion`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OficiosYA`.`usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OficiosYA`.`usuario` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `nombre_completo` VARCHAR(100) NOT NULL,
  `correo` VARCHAR(100) NOT NULL,
  `contrasena` VARCHAR(255) NOT NULL,
  `telefono` VARCHAR(20) NULL DEFAULT NULL COMMENT 'Los datos de contacto del prestador solo son visibles para el solicitante cuando el presupuesto es aceptado.',
  `id_ubicacion` INT NOT NULL,
  `id_rol` INT NOT NULL,
  `estado` ENUM('activo', 'bloqueado') NOT NULL DEFAULT 'activo',
  `fecha_registro` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `enlace_whatsapp` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE INDEX `correo_UNIQUE` (`correo` ASC) VISIBLE,
  INDEX `fk_Usuario_Rol` (`id_rol` ASC) VISIBLE,
  INDEX `fk_Usuario_Ubicacion` (`id_ubicacion` ASC) VISIBLE,
  CONSTRAINT `fk_Usuario_Rol`
    FOREIGN KEY (`id_rol`)
    REFERENCES `OficiosYA`.`rol` (`id_rol`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuario_Ubicacion`
    FOREIGN KEY (`id_ubicacion`)
    REFERENCES `OficiosYA`.`ubicacion` (`id_ubicacion`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OficiosYA`.`accion_administrador`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OficiosYA`.`accion_administrador` (
  `id_accion_administrador` INT NOT NULL AUTO_INCREMENT,
  `tipo_accion` ENUM('bloqueo', 'reactivacion', 'otro') NOT NULL,
  `fecha_hora` DATETIME NOT NULL,
  `descripcion` TEXT NULL,
  `id_admin` INT NOT NULL,
  `id_usuario_afectado` INT NOT NULL,
  PRIMARY KEY (`id_accion_administrador`),
  INDEX `fk_AccionAdministrador_Usuario` (`id_admin` ASC) VISIBLE,
  INDEX `fk_AccionAdministrador_UsuarioAfectado` (`id_usuario_afectado` ASC) VISIBLE,
  CONSTRAINT `fk_AccionAdministrador_Usuario`
    FOREIGN KEY (`id_admin`)
    REFERENCES `OficiosYA`.`usuario` (`id_usuario`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_AccionAdministrador_UsuarioAfectado`
    FOREIGN KEY (`id_usuario_afectado`)
    REFERENCES `OficiosYA`.`usuario` (`id_usuario`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OficiosYA`.`categoria`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OficiosYA`.`categoria` (
  `id_categoria` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE INDEX `nombre_UNIQUE` (`nombre` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OficiosYA`.`solicitud_servicio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OficiosYA`.`solicitud_servicio` (
  `id_solicitud_servicio` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `estado` ENUM('Iniciada', 'Enviada', 'Cotizada', 'PendienteCalificacion', 'Cerrada', 'Cancelada') NULL DEFAULT 'Iniciada',
  `id_solicitante` INT NOT NULL,
  `id_categoria` INT NOT NULL,
  `id_ubicacion` INT NOT NULL,
  `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_solicitud_servicio`),
  INDEX `fk_Solicitud_Usuario` (`id_solicitante` ASC) VISIBLE,
  INDEX `fk_Solicitud_Categoria` (`id_categoria` ASC) VISIBLE,
  INDEX `fk_Solicitud_Ubicacion` (`id_ubicacion` ASC) VISIBLE,
  CONSTRAINT `fk_Solicitud_Usuario`
    FOREIGN KEY (`id_solicitante`)
    REFERENCES `OficiosYA`.`usuario` (`id_usuario`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Solicitud_Categoria`
    FOREIGN KEY (`id_categoria`)
    REFERENCES `OficiosYA`.`categoria` (`id_categoria`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Solicitud_Ubicacion`
    FOREIGN KEY (`id_ubicacion`)
    REFERENCES `OficiosYA`.`ubicacion` (`id_ubicacion`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OficiosYA`.`calificacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OficiosYA`.`calificacion` (
  `id_calificacion` INT NOT NULL AUTO_INCREMENT,
  `estrellas` INT NOT NULL COMMENT 'El atributo estrellas debe tomar valores entre 1 y 5.',
  `comentario` TEXT NULL,
  `id_solicitante` INT NOT NULL,
  `id_prestador` INT NOT NULL,
  `id_solicitud` INT NOT NULL,
  `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_calificacion`),
  UNIQUE INDEX `unique_calificacion_solicitud` (`id_solicitud` ASC) VISIBLE,
  INDEX `fk_Calificacion_Usuario` (`id_solicitante` ASC) VISIBLE,
  INDEX `fk_Calificacion_Prestador` (`id_prestador` ASC) VISIBLE,
  INDEX `fk_Calificacion_Solicitud` (`id_solicitud` ASC) VISIBLE,
  CONSTRAINT `fk_Calificacion_Usuario`
    FOREIGN KEY (`id_solicitante`)
    REFERENCES `OficiosYA`.`usuario` (`id_usuario`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Calificacion_Prestador`
    FOREIGN KEY (`id_prestador`)
    REFERENCES `OficiosYA`.`usuario` (`id_usuario`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Calificacion_Solicitud`
    FOREIGN KEY (`id_solicitud`)
    REFERENCES `OficiosYA`.`solicitud_servicio` (`id_solicitud_servicio`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB
ROW_FORMAT = DEFAULT;


-- -----------------------------------------------------
-- Table `OficiosYA`.`imagen_prestador`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OficiosYA`.`imagen_prestador` (
  `id_imagen_prestador` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `ruta_imagen` VARCHAR(255) NULL DEFAULT NULL,
  `descripcion` TEXT NULL,
  `fecha_subida` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_imagen_prestador`),
  INDEX `fk_Imagen_Prestador` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_Imagen_Prestador`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `OficiosYA`.`usuario` (`id_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OficiosYA`.`imagen_solicitud`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OficiosYA`.`imagen_solicitud` (
  `id_imagen_solicitud` INT NOT NULL AUTO_INCREMENT,
  `id_solicitud` INT NOT NULL,
  `ruta_imagen` VARCHAR(255) NULL DEFAULT NULL,
  `descripcion` TEXT NULL,
  `fecha_subida` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_imagen_solicitud`),
  INDEX `fk_Imagen_Solicitud` (`id_solicitud` ASC) VISIBLE,
  CONSTRAINT `fk_Imagen_Solicitud`
    FOREIGN KEY (`id_solicitud`)
    REFERENCES `OficiosYA`.`solicitud_servicio` (`id_solicitud_servicio`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OficiosYA`.`notificacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OficiosYA`.`notificacion` (
  `id_notificacion` INT NOT NULL AUTO_INCREMENT,
  `id_usuario_destino` INT NOT NULL,
  `tipo` ENUM('correo', 'in-app') NOT NULL DEFAULT 'in-app',
  `mensaje` TEXT NULL,
  `fecha_envio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` ENUM('pendiente', 'enviada', 'leida') NOT NULL DEFAULT 'pendiente',
  `id_solicitud` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id_notificacion`),
  INDEX `fk_Notificaciones_Usuario` (`id_usuario_destino` ASC) VISIBLE,
  INDEX `fk_Notificaciones_Solicitud` (`id_solicitud` ASC) VISIBLE,
  CONSTRAINT `fk_Notificaciones_Usuario`
    FOREIGN KEY (`id_usuario_destino`)
    REFERENCES `OficiosYA`.`usuario` (`id_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Notificaciones_Solicitud`
    FOREIGN KEY (`id_solicitud`)
    REFERENCES `OficiosYA`.`solicitud_servicio` (`id_solicitud_servicio`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OficiosYA`.`prestador_categoria`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OficiosYA`.`prestador_categoria` (
  `id_usuario` INT NOT NULL,
  `id_categoria` INT NOT NULL,
  `descripcion_trabajo` TEXT NULL,
  PRIMARY KEY (`id_usuario`, `id_categoria`),
  INDEX `fk_Prestador_Categoria_Categoria` (`id_categoria` ASC) VISIBLE,
  CONSTRAINT `fk_Prestador_Categoria_Usuario`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `OficiosYA`.`usuario` (`id_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Prestador_Categoria_Categoria`
    FOREIGN KEY (`id_categoria`)
    REFERENCES `OficiosYA`.`categoria` (`id_categoria`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OficiosYA`.`presupuesto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OficiosYA`.`presupuesto` (
  `id_presupuesto` INT NOT NULL AUTO_INCREMENT,
  `monto` DECIMAL(10,2) NOT NULL,
  `mensaje` TEXT NULL,
  `estado` ENUM('pendiente', 'enviado', 'aceptado', 'rechazado') NULL DEFAULT 'pendiente',
  `fecha_envio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_prestador` INT NOT NULL,
  `id_solicitud` INT NOT NULL,
  PRIMARY KEY (`id_presupuesto`),
  UNIQUE INDEX `unique_prestador_solicitud` (`id_prestador` ASC, `id_solicitud` ASC) VISIBLE,
  INDEX `fk_Presupuesto_Usuario` (`id_prestador` ASC) VISIBLE,
  INDEX `fk_Presupuesto_Solicitud` (`id_solicitud` ASC) VISIBLE,
  CONSTRAINT `fk_Presupuesto_Usuario`
    FOREIGN KEY (`id_prestador`)
    REFERENCES `OficiosYA`.`usuario` (`id_usuario`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Presupuesto_Solicitud`
    FOREIGN KEY (`id_solicitud`)
    REFERENCES `OficiosYA`.`solicitud_servicio` (`id_solicitud_servicio`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
