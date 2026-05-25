BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS `Categoria` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `nombre` VARCHAR(255) NOT NULL, `descripcion` VARCHAR(255) DEFAULT '', `icono` VARCHAR(255) DEFAULT 'fa-tag', `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
CREATE TABLE IF NOT EXISTS `Clientes` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `nombre` VARCHAR(255) NOT NULL, `apellido` VARCHAR(255) NOT NULL, `email` VARCHAR(255) NOT NULL UNIQUE, `telefono` VARCHAR(255), `direccion` VARCHAR(255), `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
CREATE TABLE IF NOT EXISTS "Cupones" (
	"id"	INTEGER,
	"codigo"	VARCHAR(255) UNIQUE,
	"descuento"	INTEGER NOT NULL,
	"fecha_vencimiento"	DATE NOT NULL,
	"limite_stock"	INTEGER NOT NULL,
	"usos_actuales"	INTEGER NOT NULL DEFAULT 0,
	"activo"	TINYINT(1) NOT NULL DEFAULT 1,
	"createdAt"	DATETIME NOT NULL,
	"updatedAt"	DATETIME NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS `DetallePedidos` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `pedidoId` INTEGER NOT NULL, `productoId` INTEGER NOT NULL, `nombreProducto` VARCHAR(255) NOT NULL, `cantidad` INTEGER NOT NULL, `precioUnitario` FLOAT NOT NULL, `subtotal` FLOAT NOT NULL, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
CREATE TABLE IF NOT EXISTS `Pedidos` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `cliente` VARCHAR(255) NOT NULL, `fecha` DATE NOT NULL, `estado` VARCHAR(255) NOT NULL DEFAULT 'pendiente', `total` FLOAT NOT NULL DEFAULT '0', `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
CREATE TABLE IF NOT EXISTS `Productos` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `nombre` VARCHAR(255) NOT NULL, `precio` FLOAT DEFAULT '0', `stock` INTEGER DEFAULT 0, `categoria` VARCHAR(255), `image` VARCHAR(255), `rating` FLOAT DEFAULT '0', `reviews` INTEGER DEFAULT 0, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
CREATE TABLE IF NOT EXISTS `Tickets` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `id_pedido` INTEGER NOT NULL, `fecha_emision` DATETIME NOT NULL, `tipo_factura` VARCHAR(255) NOT NULL, `total` FLOAT NOT NULL DEFAULT '0', `CAE` VARCHAR(255) NOT NULL, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);
INSERT INTO "Cupones" ("id","codigo","descuento","fecha_vencimiento","limite_stock","usos_actuales","activo","createdAt","updatedAt") VALUES (1,'BIENVENIDA10',10,'2026-10-23',50,0,1,'2026-05-20 14:21:02.108 +00:00','2026-05-20 14:21:02.108 +00:00'),
 (2,'PROMOJULIO',15,'2026-07-31',10,0,1,'2026-05-20 14:21:02.108 +00:00','2026-05-20 14:21:02.108 +00:00'),
 (3,'SUPER30',30,'2026-06-30',10,0,1,'2026-05-20 14:21:02.108 +00:00','2026-05-20 14:21:02.108 +00:00');
INSERT INTO "Productos" ("id","nombre","precio","stock","categoria","image","rating","reviews","createdAt","updatedAt") VALUES (1,'Pava Eléctrica Corte Mate 1.7L',34990.0,45,'Electrodomésticos','/img/PavaEléctrica.png',4.5,310,'2026-05-20 20:09:26.042 +00:00','2026-05-20 20:09:26.042 +00:00'),
 (2,'Cafetera Express 15 Bares',159990.0,15,'Electrodomésticos','/img/CafeteraExpress.png',4.8,95,'2026-05-20 20:09:26.054 +00:00','2026-05-20 20:09:26.054 +00:00'),
 (3,'Licuadora de Mano 800W',42990.0,25,'Electrodomésticos','/img/LicuadoraMano.png',4.2,115,'2026-05-20 20:09:26.062 +00:00','2026-05-20 20:09:26.062 +00:00'),
 (4,'Tostadora Eléctrica - 2 Rebanadas',29990.0,35,'Electrodomésticos','/img/TostadoraElectrica.png',4.0,78,'2026-05-20 20:09:26.068 +00:00','2026-05-20 20:09:26.068 +00:00'),
 (5,'Microondas Digital 20L BGH',184990.0,12,'Electrodomésticos','/img/MicroondasBGH.png',4.6,204,'2026-05-20 20:09:26.078 +00:00','2026-05-20 20:09:26.078 +00:00'),
 (6,'Aspiradora Robot Inteligente Wi-Fi',299990.0,8,'Electrodomésticos','/img/AspiradoraRobot.png',4.4,62,'2026-05-20 20:09:26.087 +00:00','2026-05-20 20:09:26.087 +00:00'),
 (7,'Balanza de Cocina Digital 5kg',12990.0,60,'Electrodomésticos','/img/BalanzaCocina.png',4.7,412,'2026-05-20 20:09:26.097 +00:00','2026-05-20 20:09:26.097 +00:00'),
 (8,'Exprimidor de Cítricos Eléctrico 1L',24990.0,40,'Electrodomésticos','/img/ExprimidorCitricos.png',4.1,88,'2026-05-20 20:09:26.104 +00:00','2026-05-20 20:09:26.104 +00:00'),
 (9,'Soporte Celular para Auto con Carga Inalámbrica',19990.0,50,'Tecnología','/img/SoporteCelularCarga.png',4.3,134,'2026-05-20 20:09:26.115 +00:00','2026-05-20 20:09:26.115 +00:00'),
 (10,'Tablet Lenovo Tab M10 Plus 10.6 Fhd',249990.0,14,'Tecnología','/img/TabletLenovoTabM10.png',4.5,89,'2026-05-20 20:09:26.122 +00:00','2026-05-20 20:09:26.122 +00:00'),
 (11,'Aro de Luz LED 26cm con Trípode',15990.0,70,'Tecnología','/img/ArodeLuzLED.png',4.0,245,'2026-05-20 20:09:26.130 +00:00','2026-05-20 20:09:26.130 +00:00'),
 (12,'Cargador Portátil Powerbank 20000mAh',38990.0,40,'Tecnología','/img/Powerbank20000mAh.png',4.7,198,'2026-05-20 20:09:26.141 +00:00','2026-05-20 20:09:26.141 +00:00'),
 (13,'Repetidor Wi-Fi TP-Link Extensor',22990.0,55,'Tecnología','/img/RepetidorTP-Link.png',4.2,340,'2026-05-20 20:09:26.148 +00:00','2026-05-20 20:09:26.148 +00:00'),
 (14,'Smart TV 43'' Full HD Android',329990.0,7,'Tecnología','/img/SmartTV43.png',4.4,156,'2026-05-20 20:09:26.154 +00:00','2026-05-20 20:09:26.154 +00:00'),
 (15,'Cámara de Seguridad Exterior Wi-Fi 1080p',45990.0,22,'Tecnología','/img/CamaraSeguridadExterior.png',4.5,112,'2026-05-20 20:09:26.161 +00:00','2026-05-20 20:09:26.161 +00:00'),
 (16,'Mouse Óptico Inalámbrico Logitech M280',18990.0,80,'Computación','/img/MouseLogitechM280.png',4.8,520,'2026-05-20 20:09:26.167 +00:00','2026-05-20 20:09:26.167 +00:00'),
 (17,'Disco Sólido Interno SSD Kingston 480Gb',39990.0,35,'Computación','/img/SSDKingston480Gb.png',4.9,610,'2026-05-20 20:09:26.175 +00:00','2026-05-20 20:09:26.175 +00:00'),
 (18,'Memoria RAM DDR4 8Gb Fury 3200MHz',28990.0,42,'Computación','/img/RAMDDR48GbFury.png',4.8,289,'2026-05-20 20:09:26.184 +00:00','2026-05-20 20:09:26.184 +00:00'),
 (19,'Webcam Full HD 1080p con Micrófono',31990.0,28,'Computación','/img/WebcamFullHD.png',4.1,73,'2026-05-20 20:09:26.193 +00:00','2026-05-20 20:09:26.193 +00:00'),
 (20,'Hub USB-C de 4 Puertos de Aluminio',14990.0,65,'Computación','/img/HubUSB-C4Puertos.png',4.3,142,'2026-05-20 20:09:26.200 +00:00','2026-05-20 20:09:26.200 +00:00'),
 (21,'Router Gamer TP-Link Archer AC1200',64990.0,18,'Computación','/img/RouterTP-LinkArcher.png',4.6,97,'2026-05-20 20:09:26.206 +00:00','2026-05-20 20:09:26.206 +00:00'),
 (22,'Gabinete Kit Mid Tower con Fuente 500W',54990.0,15,'Computación','/img/GabineteKitMidTower.png',3.9,54,'2026-05-20 20:09:26.214 +00:00','2026-05-20 20:09:26.214 +00:00'),
 (23,'Pad Mouse Gamer Extendido 90x40cm',12500.0,100,'Computación','/img/PadMouseGamer.png',4.7,315,'2026-05-20 20:09:26.222 +00:00','2026-05-20 20:09:26.222 +00:00');
COMMIT;
