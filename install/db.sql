CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL,
  `name` NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `wanted_products` (
  `id` int(11) NOT NULL,
  `name` NOT NULL,
  `visits` int(11) NOT NULL,
  `last_visit` int(11) NOT NULL,
  PRIMARY KEY (`id`)
); 
CREATE TABLE IF NOT EXISTS `product_types` (
  `id` int(11) NOT NULL,
  `description` NOT NULL,
  `product_types_order` NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL,
  `description` NOT NULL,
  `product_type_id` NOT NULL,
  `categories_order` NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `sub_categories` (
  `id` int(11) NOT NULL,
  `description` NOT NULL,
  `category_id` NOT NULL,
  `sub_categories_order` NOT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE IF NOT EXISTS `reminders` (
  `id` INTEGER PRIMARY KEY,
  `name` NOT NULL,
  `medicine` NOT NULL,
  `begin` DATETIME NOT NULL,
  `end` datetime NULL,
  `repeat_type` NULL,
  `interval` INTEGER,
  `hours` NULL,
  `days` NULL,
  `doctor_name` NULL,
  `doctor_phone` NULL,
  `buy_reminder_days` NULL,
  `buy_available` NULL
);
CREATE TABLE IF NOT EXISTS `medicine_intake` (
  `reminder_id`,
  `intake_time`,
  `intake_postponed_time`,
  `intake` BOOLEAN NOT NULL,
  `intake_time_taken`,
  `intake_postponed` BOOLEAN NOT NULL,  
  PRIMARY KEY(reminder_id, intake_time),
  FOREIGN KEY(reminder_id) REFERENCES reminders(id)
);
CREATE TABLE IF NOT EXISTS `categories_update` (
  `codigoCategoria` int(11) NOT NULL,
  `nombreCategoria` NOT NULL,
  `orden` NOT NULL,
  `codigoCategoriaPadre` NOT NULL,
  `nivel` NOT NULL
);
