/*
 Navicat Premium Dump SQL

 Source Server         : love_note_server
 Source Server Type    : MySQL
 Source Server Version : 80030 (8.0.30)
 Source Host           : localhost:3306
 Source Schema         : love_note

 Target Server Type    : MySQL
 Target Server Version : 80030 (8.0.30)
 File Encoding         : 65001

 Date: 14/03/2025 20:20:23
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for lover_request
-- ----------------------------
DROP TABLE IF EXISTS `lover_request`;
CREATE TABLE `lover_request` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` enum('待处理','已接受','已拒绝') NOT NULL DEFAULT '待处理',
  `createdTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updatedTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `sender_uid` varchar(255) DEFAULT NULL COMMENT 'uid',
  `receiver_uid` varchar(255) DEFAULT NULL COMMENT 'uid',
  PRIMARY KEY (`id`),
  KEY `FK_bfb6861740b81b06793c6be8b91` (`sender_uid`),
  KEY `FK_5a59654a53182bf164c7ce62b6a` (`receiver_uid`),
  CONSTRAINT `FK_5a59654a53182bf164c7ce62b6a` FOREIGN KEY (`receiver_uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE,
  CONSTRAINT `FK_bfb6861740b81b06793c6be8b91` FOREIGN KEY (`sender_uid`) REFERENCES `user` (`uid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for note
-- ----------------------------
DROP TABLE IF EXISTS `note`;
CREATE TABLE `note` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL COMMENT '文章标题',
  `content` text COMMENT '文章内容',
  `relationshipId` varchar(255) DEFAULT NULL COMMENT '关系ID',
  `createdTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updatedTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_5b87d9d19127bd5d92026017a7b` (`userId`),
  CONSTRAINT `FK_5b87d9d19127bd5d92026017a7b` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for note_image
-- ----------------------------
DROP TABLE IF EXISTS `note_image`;
CREATE TABLE `note_image` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL COMMENT '图片URL',
  `width` int NOT NULL COMMENT '图片宽度',
  `height` int NOT NULL COMMENT '图片高度',
  `noteId` int DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `createdTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updatedTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `FK_ff27381811f372e9c6360ae4c0d` (`noteId`),
  CONSTRAINT `FK_ff27381811f372e9c6360ae4c0d` FOREIGN KEY (`noteId`) REFERENCES `note` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL COMMENT 'uid',
  `email` varchar(255) NOT NULL COMMENT '邮箱',
  `avatar` varchar(255) NOT NULL DEFAULT 'http://localhost:9315/uploads/default-avatar.png' COMMENT '头像',
  `username` varchar(60) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `gender` enum('0','1','2') NOT NULL DEFAULT '0' COMMENT '性别 0:未知 1:男 2:女',
  `relationshipId` varchar(255) DEFAULT NULL COMMENT '恋人关系ID',
  `createdTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
  `updatedTime` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
  `lover_uid` varchar(255) DEFAULT NULL COMMENT 'uid',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_df955cae05f17b2bcf5045cc02` (`uid`),
  UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`),
  UNIQUE KEY `REL_dae3b4e1cd00a838f90e2a0539` (`lover_uid`),
  CONSTRAINT `FK_dae3b4e1cd00a838f90e2a05391` FOREIGN KEY (`lover_uid`) REFERENCES `user` (`uid`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
