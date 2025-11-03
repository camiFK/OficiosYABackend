-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema OficiosYA
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `OficiosYA` ;

-- -----------------------------------------------------
-- Schema OficiosYA
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `OficiosYA` DEFAULT CHARACTER SET utf8mb4 ;
USE `OficiosYA` ;

-- -----------------------------------------------------
-- Table `rol`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `rol` ;

CREATE TABLE IF NOT EXISTS `rol` (
  `id_rol` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_rol`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `usuario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `usuario` ;

CREATE TABLE IF NOT EXISTS `usuario` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `correo` VARCHAR(100) NOT NULL,
  `contrasena` VARCHAR(255) NOT NULL,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'activo',
  `fecha_registro` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `id_rol` INT NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE INDEX `correo_UNIQUE` (`correo` ASC),
  INDEX `fk_Usuario_Rol_idx` (`id_rol` ASC),
  CONSTRAINT `fk_usuario_rol`
    FOREIGN KEY (`id_rol`)
    REFERENCES `rol` (`id_rol`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `accion_administrador`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `accion_administrador` ;

CREATE TABLE IF NOT EXISTS `accion_administrador` (
  `id_accion_administrador` INT NOT NULL AUTO_INCREMENT,
  `tipo_accion` VARCHAR(30) NOT NULL,
  `fecha_hora` DATETIME NOT NULL,
  `descripcion` TEXT NULL,
  `id_admin` INT NOT NULL,
  `id_usuario_afectado` INT NOT NULL,
  PRIMARY KEY (`id_accion_administrador`),
  INDEX `fk_admin_usuario` (`id_admin` ASC),
  INDEX `fk_admin_usuario_afectado` (`id_usuario_afectado` ASC),
  CONSTRAINT `fk_admin_usuario`
    FOREIGN KEY (`id_admin`)
    REFERENCES `usuario` (`id_usuario`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_admin_usuario_afectado`
    FOREIGN KEY (`id_usuario_afectado`)
    REFERENCES `usuario` (`id_usuario`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ubicacion`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ubicacion` ;

CREATE TABLE IF NOT EXISTS `ubicacion` (
  `id_ubicacion` INT NOT NULL AUTO_INCREMENT,
  `localidad` VARCHAR(100) NOT NULL,
  `provincia` VARCHAR(100) NOT NULL,
  `direccion` VARCHAR(255) NULL,
  PRIMARY KEY (`id_ubicacion`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `cliente`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `cliente` ;

CREATE TABLE IF NOT EXISTS `cliente` (
  `id_cliente` INT NOT NULL AUTO_INCREMENT,
  `fecha_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `nombre_completo` VARCHAR(100) NOT NULL,
  `id_ubicacion` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  PRIMARY KEY (`id_cliente`),
  INDEX `fk_cliente_ubicacion_idx` (`id_ubicacion` ASC),
  UNIQUE INDEX `id_usuario_UNIQUE` (`id_usuario` ASC),
  CONSTRAINT `fk_cliente_usuario`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `usuario` (`id_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_cliente_ubicacion`
    FOREIGN KEY (`id_ubicacion`)
    REFERENCES `ubicacion` (`id_ubicacion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `prestador`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `prestador` ;

CREATE TABLE IF NOT EXISTS `prestador` (
  `id_prestador` INT NOT NULL AUTO_INCREMENT,
  `descripcion` TEXT NULL,
  `experiencia` TEXT NULL,
  `fecha_alta` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `nombre_completo` VARCHAR(100) NOT NULL,
  `telefono` VARCHAR(20) NULL,
  `id_ubicacion` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  PRIMARY KEY (`id_prestador`),
  INDEX `fk_Prestador_Ubicacion_idx` (`id_ubicacion` ASC),
  INDEX `fk_prestador_usuario_idx` (`id_usuario` ASC),
  CONSTRAINT `fk_prestador_usuario`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `usuario` (`id_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_prestador_ubicacion`
    FOREIGN KEY (`id_ubicacion`)
    REFERENCES `ubicacion` (`id_ubicacion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `categoria`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `categoria` ;

CREATE TABLE IF NOT EXISTS `categoria` (
  `id_categoria` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE INDEX `nombre_UNIQUE` (`nombre` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `solicitud_servicio`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `solicitud_servicio` ;

CREATE TABLE IF NOT EXISTS `solicitud_servicio` (
  `id_solicitud_servicio` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `estado` VARCHAR(30) NOT NULL DEFAULT 'Iniciada',
  `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_cliente` INT NOT NULL,
  `id_categoria` INT NOT NULL,
  `id_ubicacion` INT NOT NULL,
  PRIMARY KEY (`id_solicitud_servicio`),
  INDEX `fk_solicitud_categoria` (`id_categoria` ASC),
  INDEX `fk_solicitud_cliente` (`id_cliente` ASC),
  INDEX `fk_solicitud_ubicacion_idx` (`id_ubicacion` ASC),
  CONSTRAINT `fk_solicitud_cliente`
    FOREIGN KEY (`id_cliente`)
    REFERENCES `cliente` (`id_cliente`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_solicitud_categoria`
    FOREIGN KEY (`id_categoria`)
    REFERENCES `categoria` (`id_categoria`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_solicitud_ubicacion`
    FOREIGN KEY (`id_ubicacion`)
    REFERENCES `ubicacion` (`id_ubicacion`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `calificacion`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `calificacion` ;

CREATE TABLE IF NOT EXISTS `calificacion` (
  `id_calificacion` INT NOT NULL AUTO_INCREMENT,
  `estrellas` INT NOT NULL COMMENT 'El atributo estrellas debe tomar valores entre 1 y 5.',
  `comentario` TEXT NULL,
  `fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_cliente` INT NOT NULL,
  `id_prestador` INT NOT NULL,
  `id_solicitud` INT NOT NULL,
  PRIMARY KEY (`id_calificacion`),
  UNIQUE INDEX `unique_calificacion_solicitud` (`id_solicitud` ASC),
  INDEX `fk_calificacion_solicitud` (`id_solicitud` ASC),
  INDEX `fk_calificacion_cliente_idx` (`id_cliente` ASC),
  INDEX `fk_calificacion_prestador_idx` (`id_prestador` ASC),
  CONSTRAINT `fk_calificacion_cliente`
    FOREIGN KEY (`id_cliente`)
    REFERENCES `cliente` (`id_cliente`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_calificacion_prestador`
    FOREIGN KEY (`id_prestador`)
    REFERENCES `prestador` (`id_prestador`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_calificacion_solicitud`
    FOREIGN KEY (`id_solicitud`)
    REFERENCES `solicitud_servicio` (`id_solicitud_servicio`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB
ROW_FORMAT = DEFAULT;


-- -----------------------------------------------------
-- Table `imagen_prestador`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `imagen_prestador` ;

CREATE TABLE IF NOT EXISTS `imagen_prestador` (
  `id_imagen_prestador` INT NOT NULL AUTO_INCREMENT,
  `id_prestador` INT NOT NULL,
  `ruta_imagen` VARCHAR(255) NULL DEFAULT NULL,
  `descripcion` TEXT NULL,
  `fecha_subida` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_imagen_prestador`),
  INDEX `fk_imagen_prestador_idx` (`id_prestador` ASC),
  CONSTRAINT `fk_imagen_prestador`
    FOREIGN KEY (`id_prestador`)
    REFERENCES `prestador` (`id_prestador`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `imagen_solicitud`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `imagen_solicitud` ;

CREATE TABLE IF NOT EXISTS `imagen_solicitud` (
  `id_imagen_solicitud` INT NOT NULL AUTO_INCREMENT,
  `id_solicitud` INT NOT NULL,
  `ruta_imagen` VARCHAR(255) NULL DEFAULT NULL,
  `descripcion` TEXT NULL,
  `fecha_subida` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_imagen_solicitud`),
  INDEX `fk_imagen_solicitud` (`id_solicitud` ASC),
  CONSTRAINT `fk_imagen_solicitud`
    FOREIGN KEY (`id_solicitud`)
    REFERENCES `solicitud_servicio` (`id_solicitud_servicio`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `notificacion`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `notificacion` ;

CREATE TABLE IF NOT EXISTS `notificacion` (
  `id_notificacion` INT NOT NULL AUTO_INCREMENT,
  `id_usuario_destino` INT NOT NULL,
  `tipo` VARCHAR(20) NOT NULL DEFAULT 'in-app',
  `mensaje` TEXT NULL,
  `fecha_envio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  `id_solicitud` INT NULL,
  PRIMARY KEY (`id_notificacion`),
  INDEX `fk_notificaciones_usuario` (`id_usuario_destino` ASC),
  INDEX `fk_notificaciones_solicitud` (`id_solicitud` ASC),
  CONSTRAINT `fk_notificaciones_usuario`
    FOREIGN KEY (`id_usuario_destino`)
    REFERENCES `usuario` (`id_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_notificaciones_solicitud`
    FOREIGN KEY (`id_solicitud`)
    REFERENCES `solicitud_servicio` (`id_solicitud_servicio`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `prestador_categoria`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `prestador_categoria` ;

CREATE TABLE IF NOT EXISTS `prestador_categoria` (
  `id_prestador` INT NOT NULL,
  `id_categoria` INT NOT NULL,
  `descripcion_trabajo` TEXT NULL,
  INDEX `fk_prestador_categoria_categoria` (`id_categoria` ASC),
  INDEX `fk_prestador_categoria_idx` (`id_prestador` ASC),
  CONSTRAINT `fk_prestador_categoria`
    FOREIGN KEY (`id_prestador`)
    REFERENCES `prestador` (`id_prestador`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_prestador_categoria_categoria`
    FOREIGN KEY (`id_categoria`)
    REFERENCES `categoria` (`id_categoria`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `presupuesto`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `presupuesto` ;

CREATE TABLE IF NOT EXISTS `presupuesto` (
  `id_presupuesto` INT NOT NULL AUTO_INCREMENT,
  `monto` DECIMAL(10,2) NOT NULL,
  `mensaje` TEXT NULL,
  `estado` VARCHAR(20) NULL DEFAULT 'pendiente',
  `fecha_envio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_prestador` INT NOT NULL,
  `id_solicitud` INT NOT NULL,
  PRIMARY KEY (`id_presupuesto`),
  UNIQUE INDEX `unique_prestador_solicitud` (`id_prestador` ASC, `id_solicitud` ASC),
  INDEX `fk_presupuesto_solicitud` (`id_solicitud` ASC),
  CONSTRAINT `fk_presupuesto_prestador`
    FOREIGN KEY (`id_prestador`)
    REFERENCES `prestador` (`id_prestador`)
    ON DELETE RESTRICT
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_presupuesto_solicitud`
    FOREIGN KEY (`id_solicitud`)
    REFERENCES `solicitud_servicio` (`id_solicitud_servicio`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `solicitud_prestador`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `solicitud_prestador` ;

CREATE TABLE IF NOT EXISTS `solicitud_prestador` (
  `id_solicitud_prestador` INT NOT NULL AUTO_INCREMENT,
  `id_solicitud` INT NOT NULL,
  `id_prestador` INT NOT NULL,
  `fecha_envio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_solicitud_prestador`),
  INDEX `fk_SolicitudPrestador_Solicitud_idx` (`id_solicitud` ASC),
  INDEX `fk_solicitud_prestador_idx` (`id_prestador` ASC),
  CONSTRAINT `fk_solicitud_servicio`
    FOREIGN KEY (`id_solicitud`)
    REFERENCES `solicitud_servicio` (`id_solicitud_servicio`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_solicitud_prestador`
    FOREIGN KEY (`id_prestador`)
    REFERENCES `prestador` (`id_prestador`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `promedio_calificaciones`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `promedio_calificaciones` ;

CREATE TABLE IF NOT EXISTS `promedio_calificaciones` (
  `id_promedio_calificaciones` INT NOT NULL AUTO_INCREMENT,
  `id_prestador` INT NOT NULL,
  `promedio` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `cantidad_calificacion` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_promedio_calificaciones`),
  INDEX `fk_promedio_prestador_idx` (`id_prestador` ASC),
  CONSTRAINT `fk_promedio_prestador`
    FOREIGN KEY (`id_prestador`)
    REFERENCES `prestador` (`id_prestador`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `reporte`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `reporte` ;

CREATE TABLE IF NOT EXISTS `reporte` (
  `id_reporte` INT NOT NULL AUTO_INCREMENT,
  `id_usuario_reportante` INT NOT NULL,
  `id_usuario_reportado` INT NOT NULL,
  `motivo` TEXT NOT NULL,
  `fecha_reporte` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (`id_reporte`),
  INDEX `fk_reporte_reportante_idx` (`id_usuario_reportante` ASC),
  INDEX `fk_reporte_reportado_idx` (`id_usuario_reportado` ASC),
  CONSTRAINT `fk_reporte_reportante`
    FOREIGN KEY (`id_usuario_reportante`)
    REFERENCES `usuario` (`id_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reporte_reportado`
    FOREIGN KEY (`id_usuario_reportado`)
    REFERENCES `usuario` (`id_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
