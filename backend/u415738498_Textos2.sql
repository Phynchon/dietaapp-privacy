-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 26-04-2026 a las 08:42:53
-- Versión del servidor: 11.8.6-MariaDB-log
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u415738498_Textos2`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consult_messages`
--

CREATE TABLE `consult_messages` (
  `id` char(36) NOT NULL,
  `language` varchar(8) NOT NULL,
  `diet_calories` smallint(5) UNSIGNED DEFAULT NULL,
  `menu_label` varchar(255) DEFAULT NULL,
  `message_text` text NOT NULL,
  `created_at` datetime NOT NULL,
  `status` enum('new','replied') NOT NULL DEFAULT 'new',
  `reply_text` text DEFAULT NULL,
  `replied_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `daily_checkins`
--

CREATE TABLE `daily_checkins` (
  `id` char(36) NOT NULL,
  `program_id` char(36) NOT NULL,
  `day_number` smallint(5) UNSIGNED NOT NULL,
  `tracking_date` date NOT NULL,
  `breakfast_done` tinyint(1) NOT NULL DEFAULT 0,
  `lunch_done` tinyint(1) NOT NULL DEFAULT 0,
  `meal_done` tinyint(1) NOT NULL DEFAULT 0,
  `snack_done` tinyint(1) NOT NULL DEFAULT 0,
  `dinner_done` tinyint(1) NOT NULL DEFAULT 0,
  `total_calories` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `calories_target` smallint(5) UNSIGNED NOT NULL,
  `calories_saved` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `calories_extra` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `recorded_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `program_cycles`
--

CREATE TABLE `program_cycles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `diet_level` smallint(5) UNSIGNED NOT NULL,
  `calories_target` smallint(5) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `start_datetime` datetime NOT NULL,
  `planned_days` smallint(5) UNSIGNED NOT NULL DEFAULT 56,
  `status` enum('pending_start','active','completed','dropped') NOT NULL DEFAULT 'pending_start',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `alias` varchar(120) DEFAULT NULL,
  `country` varchar(120) DEFAULT NULL,
  `age` tinyint(3) UNSIGNED DEFAULT NULL,
  `gender` enum('female','male','other','unknown') DEFAULT NULL,
  `height_cm` decimal(5,2) DEFAULT NULL,
  `weight_kg` decimal(6,2) DEFAULT NULL,
  `imc` decimal(5,2) DEFAULT NULL,
  `start_datetime` datetime NOT NULL,
  `current_datetime` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `consult_messages`
--
ALTER TABLE `consult_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_consults_created` (`created_at`),
  ADD KEY `idx_consults_status` (`status`);

--
-- Indices de la tabla `daily_checkins`
--
ALTER TABLE `daily_checkins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_program_tracking_date` (`program_id`,`tracking_date`),
  ADD KEY `idx_program_day` (`program_id`,`day_number`);

--
-- Indices de la tabla `program_cycles`
--
ALTER TABLE `program_cycles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_program_user_status` (`user_id`,`status`),
  ADD KEY `idx_program_start_date` (`start_date`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_users_alias` (`alias`),
  ADD KEY `idx_users_country` (`country`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `daily_checkins`
--
ALTER TABLE `daily_checkins`
  ADD CONSTRAINT `fk_daily_program` FOREIGN KEY (`program_id`) REFERENCES `program_cycles` (`id`);

--
-- Filtros para la tabla `program_cycles`
--
ALTER TABLE `program_cycles`
  ADD CONSTRAINT `fk_program_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
