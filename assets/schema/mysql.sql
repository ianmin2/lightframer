-- File name: C:\Users\imbae\Desktop\test.sql
-- Created by DMSoft Technologies 

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS organizations;
CREATE TABLE `organizations` (
  `org_id` BIGINT(64) AUTO_INCREMENT,
  `org_name` TEXT NOT NULL,
  `org_telephone` TEXT NOT NULL,
  `org_email` TEXT NOT NULL,
  `org_code` CHAR(25) NOT NULL,
  `org_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `org_active` BOOL DEFAULT 0,
  PRIMARY KEY (`org_id` ASC),
  UNIQUE KEY `unique_organization_name_required` (`org_name`(10) ASC),
  UNIQUE KEY `unique_organization_telephone_required` (`org_telephone`(10) ASC),
  UNIQUE KEY `unique_organization_email_required` (`org_email`(10) ASC),
  UNIQUE KEY `unique_organization_code_required` (`org_code` ASC)
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--
-- Table structure for table `aud_organizations`
--

DROP TABLE IF EXISTS aud_organizations;
CREATE TABLE `aud_organizations` (
  `org_id` BIGINT(64),
  `org_name` TEXT,
  `org_telephone` TEXT,
  `org_email` TEXT,
  `org_code` CHAR(25),
  `org_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `org_active` BOOL DEFAULT 0,
  `func` CHAR(15) NULL
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--- ORGANIZATIONS
DROP TRIGGER IF EXISTS tr_organizations_after_update;
CREATE TRIGGER tr_organizations_after_update AFTER UPDATE ON organizations
  FOR EACH ROW BEGIN
        INSERT INTO aud_organizations (org_id,org_name,org_telephone,org_email,org_code,org_added,org_active,func) 
        SELECT OLD.org_id,OLD.org_name,OLD.org_telephone,OLD.org_email,OLD.org_code,OLD.org_added,OLD.org_active,'UPDATE';
  END;

DROP TRIGGER IF EXISTS tr_organizations_after_delete;
CREATE TRIGGER tr_organizations_after_delete AFTER UPDATE ON organizations
FOR EACH ROW BEGIN
    INSERT INTO aud_organizations (org_id,org_name,org_telephone,org_email,org_code,org_added,org_active,func) 
        SELECT OLD.org_id,OLD.org_name,OLD.org_telephone,OLD.org_email,OLD.org_code,OLD.org_added,OLD.org_active,'DELETE';
END;

--==========================================================================================================



--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS services;
CREATE TABLE `services` (
  `service_id` BIGINT(64) AUTO_INCREMENT,
  `service_name` TEXT NOT NULL,
  `service_fee` BIGINT(64) NOT NULL,
  `service_code` TEXT NOT NULL,
  `service_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `service_active` BOOL DEFAULT 0,
  PRIMARY KEY (`service_id` ASC),
  UNIQUE KEY `unique_service_name_required` (`service_name`(10) ASC),
  UNIQUE KEY `unique_service_coed_required` (`service_code`(10) ASC)
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--
-- Table structure for table `aud_services`
--

DROP TABLE IF EXISTS aud_services;
CREATE TABLE `aud_services` (
  `service_id` BIGINT(64),
  `service_name` TEXT,
  `service_fee` BIGINT(64),
  `service_code` TEXT,
  `service_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `service_active` BOOL DEFAULT 0,
  `func` CHAR(15) NULL
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--- SERVICES 
DROP TRIGGER IF EXISTS tr_services_after_update;
CREATE TRIGGER tr_services_after_update AFTER UPDATE ON services
  FOR EACH ROW BEGIN
        INSERT INTO aud_services (service_id,service_name,service_fee,service_code,service_added,service_active,func) 
        SELECT OLD.service_id,OLD.service_name,OLD.service_fee,OLD.service_code,OLD.service_added,OLD.service_active,'UPDATE';
  END;

DROP TRIGGER IF EXISTS tr_services_after_delete;
CREATE TRIGGER tr_services_after_delete AFTER UPDATE ON services
FOR EACH ROW BEGIN
    INSERT INTO aud_services (service_id,service_name,service_fee,service_code,service_added,service_active,func) 
    SELECT OLD.service_id,OLD.service_name,OLD.service_fee,OLD.service_code,OLD.service_added,OLD.service_active,'DELETE';
END;

--==========================================================================================================

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS subscriptions;
CREATE TABLE `subscriptions` (
  `sub_id` BIGINT(64) AUTO_INCREMENT,
  `sub_org` BIGINT(64) NOT NULL,
  `sub_service` BIGINT(64) NOT NULL,
  `sub_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `sub_active` BOOL DEFAULT 0,
  PRIMARY KEY (`sub_id` ASC),
  CONSTRAINT `organization_id_required` FOREIGN KEY (`sub_org`) REFERENCES `organizations` (`org_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `service_subscription_required` FOREIGN KEY (`sub_service`) REFERENCES `services` (`service_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--
-- Table structure for table `aud_subscriptions`
--

DROP TABLE IF EXISTS aud_subscriptions;
CREATE TABLE `aud_subscriptions` (
  `sub_id` BIGINT(64),
  `sub_org` BIGINT(64),
  `sub_service` BIGINT(64),
  `sub_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `sub_active` BOOL DEFAULT 0,
  `func` CHAR(15) NULL
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;



--- SUBSCRIPTIONS
DROP TRIGGER IF EXISTS tr_subscriptions_after_update;
CREATE TRIGGER tr_subscriptions_after_update AFTER UPDATE ON subscriptions
  FOR EACH ROW BEGIN
    INSERT INTO aud_subscriptions (sub_id,sub_org,sub_service,sub_added,sub_active,func) 
    SELECT OLD.sub_id,OLD.sub_org,OLD.sub_service,OLD.sub_added,OLD.sub_active,'UPDATE';
  END;

DROP TRIGGER IF EXISTS tr_subscriptions_after_delete;
CREATE TRIGGER tr_subscriptions_after_delete AFTER UPDATE ON subscriptions
FOR EACH ROW BEGIN
    INSERT INTO aud_subscriptions (sub_id,sub_org,sub_service,sub_added,sub_active,func) 
    SELECT OLD.sub_id,OLD.sub_org,OLD.sub_service,OLD.sub_added,OLD.sub_active,'DELETE';
END;

--==========================================================================================================

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS payment_methods;
CREATE TABLE `payment_methods` (
  `pay_method_id` BIGINT(64) AUTO_INCREMENT,
  `pay_method_name` CHAR(60) NOT NULL,
  `pay_method_fee` BIGINT(64) DEFAULT 0,
  `pay_method_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `pay_method_active` BOOL DEFAULT 0,
  PRIMARY KEY (`pay_method_id` ASC)
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--
-- Table structure for table `aud_payment_methods`
--

DROP TABLE IF EXISTS aud_payment_methods;
CREATE TABLE `aud_payment_methods` (
  `pay_method_id` BIGINT(64),
  `pay_method_name` CHAR(60),
  `pay_method_fee` BIGINT(64) DEFAULT 0,
  `pay_method_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `pay_method_active` BOOL DEFAULT 0,
  `func` CHAR(15) NULL
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--- PAYMENT_METHODS
DROP TRIGGER IF EXISTS tr_payment_methods_after_update;
CREATE TRIGGER tr_payment_methods_after_update AFTER UPDATE ON payment_methods
  FOR EACH ROW BEGIN
        INSERT INTO aud_payment_methods (pay_method_id,pay_method_name,pay_method_fee,pay_method_added,pay_method_active,func) 
        SELECT OLD.pay_method_id,OLD.pay_method_name,OLD.pay_method_fee,OLD.pay_method_added,OLD.pay_method_active,'UPDATE';
  END;

DROP TRIGGER IF EXISTS tr_payment_methods_after_delete;
CREATE TRIGGER tr_payment_methods_after_delete AFTER UPDATE ON payment_methods
FOR EACH ROW BEGIN
    INSERT INTO aud_payment_methods (pay_method_id,pay_method_name,pay_method_fee,pay_method_added,pay_method_active,func) 
    SELECT OLD.pay_method_id,OLD.pay_method_name,OLD.pay_method_fee,OLD.pay_method_added,OLD.pay_method_active,'DELETE';
END;

--==========================================================================================================

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS payments;
CREATE TABLE `payments` (
  `pay_id` BIGINT(64) AUTO_INCREMENT,
  `pay_org` BIGINT(64),
  `pay_amount` BIGINT(64) NOT NULL,
  `pay_method` BIGINT(64) NOT NULL,
  `pay_services` TEXT NOT NULL,
  `pay_token` TEXT NOT NULL,
  `pay_message` TEXT,
  `pay_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `pay_active` BOOL DEFAULT 0,
  PRIMARY KEY (`pay_id` ASC),
  UNIQUE KEY `token_not_used` (`pay_token`(10) ASC),
  CONSTRAINT `valid_pay_organization_required` FOREIGN KEY (`pay_org`) REFERENCES `organizations` (`org_id`),
  CONSTRAINT `valid_pay_method_required` FOREIGN KEY (`pay_method`) REFERENCES `payment_methods` (`pay_method_id`)
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--
-- Table structure for table `aud_payments`
--

DROP TABLE IF EXISTS aud_payments;
CREATE TABLE `aud_payments` (
  `pay_id` BIGINT(64),
  `pay_org` BIGINT(64),
  `pay_amount` BIGINT(64),
  `pay_method` BIGINT(64),
  `pay_services` TEXT,
  `pay_token` TEXT,
  `pay_message` TEXT,
  `pay_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `pay_active` BOOL,
  `func` CHAR(15) NULL
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;



--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS members;
CREATE TABLE `members` (
  `member_id` BIGINT(64) AUTO_INCREMENT,
  `name.first` CHAR(25) NOT NULL,
  `name.last` CHAR(25),
  `account.name` CHAR(50) NOT NULL,
  `account.balance` BIGINT(64) DEFAULT 0,
  `organization` BIGINT(64),
  `email` CHAR(75) NOT NULL,
  `password` TEXT NOT NULL,
  `role` ENUM ('audit','client','admin'),
  `telephone` CHAR(15) NOT NULL,
  `joined` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `active` BOOL DEFAULT 0,
  PRIMARY KEY (`member_id` ASC),
  UNIQUE KEY `members_account.name_key` (`account.name` ASC),
  UNIQUE KEY `members_email_key` (`email` ASC),
  CONSTRAINT `valid_member_organization_required` FOREIGN KEY (`organization`) REFERENCES `organizations` (`org_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--
-- Table structure for table `aud_members`
--

DROP TABLE IF EXISTS aud_members;
CREATE TABLE `aud_members` (
  `member_id` BIGINT(64),
  `name.first` CHAR(25),
  `name.last` CHAR(25),
  `account.name` CHAR(50),
  `account.balance` BIGINT(64),
  `organization` BIGINT(64),
  `email` CHAR(75),
  `password` TEXT,
  `role` ENUM ('audit','client','admin'),
  `telephone` CHAR(15),
  `joined` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `active` BOOL DEFAULT 0,
  `func` CHAR(15) NULL
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;



--
-- Table structure for table `password_recovery`
--

DROP TABLE IF EXISTS password_recovery;
CREATE TABLE `password_recovery` (
  `password_recovery_id` BIGINT(64) AUTO_INCREMENT,
  `member` BIGINT(64) NOT NULL,
  `recovery_key` TEXT,
  `requested` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `used` BOOL DEFAULT 0,
  `used_at` TIMESTAMP,
  PRIMARY KEY (`password_recovery_id` ASC),
  CONSTRAINT `valid_member_required` FOREIGN KEY (`member`) REFERENCES `members` (`member_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--
-- Table structure for table `aud_password_recovery`
--

DROP TABLE IF EXISTS aud_password_recovery;
CREATE TABLE `aud_password_recovery` (
  `password_recovery_id` BIGINT(64),
  `member` BIGINT(64),
  `recovery_key` TEXT,
  `requested` TIMESTAMP,
  `used` BOOL,
  `used_at` TIMESTAMP,
  `func` CHAR(15) NULL
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;

--- PASSWORD_RECOVERY TRIGGER FUNCTION
DROP TRIGGER IF EXISTS tr_password_recovery_after_update;
CREATE TRIGGER tr_password_recovery_after_update AFTER UPDATE ON password_recovery
  FOR EACH ROW BEGIN
    INSERT INTO aud_password_recovery (password_recovery_id,member,recovery_key,requested,used,used_at,func) 
    SELECT OLD.password_recovery_id,OLD.member,OLD.recovery_key,OLD.requested,OLD.used,OLD.used_at,'UPDATE';
  END;

DROP TRIGGER IF EXISTS tr_password_recovery_after_delete;
CREATE TRIGGER tr_password_recovery_after_delete AFTER UPDATE ON password_recovery
FOR EACH ROW BEGIN
    INSERT INTO aud_password_recovery (password_recovery_id,member,recovery_key,requested,used,used_at,func) 
    SELECT OLD.password_recovery_id,OLD.member,OLD.recovery_key,OLD.requested,OLD.used,OLD.used_at,'DELETE';
END;

--==========================================================================================================


--
-- Table structure for table `groups`
--

DROP TABLE IF EXISTS groups;
CREATE TABLE `groups` (
  `group_id` BIGINT(64) AUTO_INCREMENT,
  `group_name` TEXT NOT NULL,
  `group_organization` BIGINT(64) NOT NULL,
  `group_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `group_active` BOOL DEFAULT 0,
  PRIMARY KEY (`group_id` ASC),
  UNIQUE KEY `unique_group_name_required` (`group_name`(10) ASC),
  CONSTRAINT `group_organization_reqired` FOREIGN KEY (`group_organization`) REFERENCES `organizations` (`org_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--
-- Table structure for table `aud_groups`
--

DROP TABLE IF EXISTS aud_groups;
CREATE TABLE `aud_groups` (
  `group_id` BIGINT(64),
  `group_name` TEXT,
  `group_organization` BIGINT(64),
  `group_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `group_active` BOOL DEFAULT 0,
  `func` CHAR(15) NULL
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;



--- AUDIT_GROUPS
DROP TRIGGER IF EXISTS tr_groups_after_update;
CREATE TRIGGER tr_groups_after_update AFTER UPDATE ON groups
  FOR EACH ROW BEGIN
    INSERT INTO aud_groups (group_id,group_name,group_organization,group_added,group_active,func) 
    SELECT OLD.group_id,OLD.group_name,OLD.group_organization,OLD.group_added,OLD.group_active,'UPDATE';
  END;

DROP TRIGGER IF EXISTS tr_groups_after_delete;
CREATE TRIGGER tr_groups_after_delete AFTER UPDATE ON groups
FOR EACH ROW BEGIN
    INSERT INTO aud_groups (group_id,group_name,group_organization,group_added,group_active,func) 
    SELECT OLD.group_id,OLD.group_name,OLD.group_organization,OLD.group_added,OLD.group_active,'DELETE';
END;

--==========================================================================================================

--
-- Table structure for table `group_members`
--

DROP TABLE IF EXISTS group_members;
CREATE TABLE `group_members` (
  `mem_id` BIGINT(64) AUTO_INCREMENT,
  `mem_name` CHAR(55),
  `mem_user` TEXT,
  `mem_phone` TEXT NOT NULL,
  `mem_email` CHAR(50),
  `mem_group` BIGINT(64) NOT NULL,
  `mem_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `mem_active` BOOL DEFAULT 0,
  PRIMARY KEY (`mem_id` ASC),
  UNIQUE KEY `unique_email_per_group` (`mem_group` ASC,`mem_email` ASC),
  UNIQUE KEY `unique_telephone_per_group` (`mem_group` ASC,`mem_phone`(10) ASC),
  CONSTRAINT `mem_group_reqired` FOREIGN KEY (`mem_group`) REFERENCES `groups` (`group_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--
-- Table structure for table `aud_group_members`
--
DROP TABLE IF EXISTS aud_group_members;
CREATE TABLE `aud_group_members` (
  `mem_id` BIGINT(64),
  `mem_name` CHAR(55),
  `mem_user` TEXT,
  `mem_phone` TEXT,
  `mem_email` CHAR(50),
  `mem_group` BIGINT(64),
  `mem_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `mem_active` BOOL DEFAULT 0,
  `func` CHAR(15) NULL
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--- AUDIT_GROUP_MEMBERS
DROP TRIGGER IF EXISTS tr_group_members_after_update;
CREATE TRIGGER tr_group_members_after_update AFTER UPDATE ON group_members
  FOR EACH ROW BEGIN
    INSERT INTO aud_group_members (mem_id,mem_name,mem_user,mem_phone,mem_email,mem_group,mem_added,mem_active,func) 
    SELECT OLD.mem_id,OLD.mem_name,OLD.mem_user,OLD.mem_phone,OLD.mem_email,OLD.mem_group,OLD.mem_added,OLD.mem_active,'UPDATE';
  END;

DROP TRIGGER IF EXISTS tr_group_members_after_delete;
CREATE TRIGGER tr_group_members_after_delete AFTER UPDATE ON group_members
FOR EACH ROW BEGIN
    INSERT INTO aud_group_members (mem_id,mem_name,mem_user,mem_phone,mem_email,mem_group,mem_added,mem_active,func) 
    SELECT OLD.mem_id,OLD.mem_name,OLD.mem_user,OLD.mem_phone,OLD.mem_email,OLD.mem_group,OLD.mem_added,OLD.mem_active,'DELETE';
END;

--==========================================================================================================

--
-- Table structure for table `templates`
--

DROP TABLE IF EXISTS templates;
CREATE TABLE `templates` (
  `t_id` BIGINT(64) AUTO_INCREMENT,
  `t_name` TEXT NOT NULL,
  `t_organization` BIGINT(64) NOT NULL,
  `t_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `t_active` BOOL DEFAULT 0,
  PRIMARY KEY (`t_id` ASC),
  UNIQUE KEY `unique_template_name_required` (`t_name`(10) ASC),
  CONSTRAINT `valid_template_organization_reqired` FOREIGN KEY (`t_organization`) REFERENCES `organizations` (`org_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;

--
-- Table structure for table `aud_templates`
--

DROP TABLE IF EXISTS aud_templates;
CREATE TABLE `aud_templates` (
  `t_id` BIGINT(64),
  `t_name` TEXT,
  `t_organization` BIGINT(64),
  `t_added` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `t_active` BOOL DEFAULT 0,
  `func` CHAR(15) NULL
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--- AUDIT_TEMPLATES
DROP TRIGGER IF EXISTS tr_templates_after_update;
CREATE TRIGGER tr_templates_after_update AFTER UPDATE ON templates
  FOR EACH ROW BEGIN
     INSERT INTO aud_templates (t_id,t_name,t_organization,t_added,t_active,func) 
    SELECT OLD.t_id,OLD.t_name,OLD.t_organization,OLD.t_added,OLD.t_active,'UPDATE';
  END;

DROP TRIGGER IF EXISTS tr_templates_after_delete;
CREATE TRIGGER tr_templates_after_delete AFTER UPDATE ON templates
FOR EACH ROW BEGIN
    INSERT INTO aud_templates (t_id,t_name,t_organization,t_added,t_active,func) 
    SELECT OLD.t_id,OLD.t_name,OLD.t_organization,OLD.t_added,OLD.t_active,'DELETE';
END;


--==========================================================================================================

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS logs;
CREATE TABLE `logs` (
  `log_id` BIGINT(64) AUTO_INCREMENT,
  `log_summary` TEXT,
  `log_organization` BIGINT(64),
  `log_reference` BIGINT(64) NOT NULL,
  `log_time` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `log_balance` BIGINT(64) DEFAULT 0,
  PRIMARY KEY (`log_id` ASC),
  CONSTRAINT `valid_organization_required` FOREIGN KEY (`log_organization`) REFERENCES `organizations` (`org_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;


--
-- Table structure for table `aud_logs`
--

DROP TABLE IF EXISTS aud_logs;
CREATE TABLE `aud_logs` (
  `log_id` BIGINT(64),
  `log_summary` TEXT,
  `log_organization` BIGINT(64),
  `log_reference` BIGINT(64),
  `log_time` TIMESTAMP NULL DEFAULT '0000-00-00 00:00:00',
  `log_balance` BIGINT(64) DEFAULT 0
) DEFAULT CHARSET=utf8 ENGINE=InnoDB;



--- AUDIT_LOGS
DROP TRIGGER IF EXISTS tr_logs_after_update;
CREATE TRIGGER tr_logs_after_update AFTER UPDATE ON logs
  FOR EACH ROW BEGIN
     INSERT INTO aud_logs (log_id,log_summary,log_organization,log_reference,log_time,log_balance,func) 
     SELECT OLD.log_id,OLD.log_summary,OLD.log_organization,OLD.log_reference,OLD.log_time,OLD.log_balance,'UPDATE';
  END;

DROP TRIGGER IF EXISTS tr_logs_after_delete;
CREATE TRIGGER tr_logs_after_delete AFTER UPDATE ON logs
FOR EACH ROW BEGIN
    INSERT INTO aud_logs (log_id,log_summary,log_organization,log_reference,log_time,log_balance,func) 
    SELECT OLD.log_id,OLD.log_summary,OLD.log_organization,OLD.log_reference,OLD.log_time,OLD.log_balance,'DELETE';
END;

--==========================================================================================================




--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`org_id`,`org_name`,`org_telephone`,`org_email`,`org_code`,`org_added`,`org_active`) VALUES (1,'Bixbyte Solutions','+254725678447','info@bixbyte.io','pm_bx_001','2018-03-16 13:01:14.912051',1);

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`group_id`,`group_name`,`group_organization`,`group_added`,`group_active`) VALUES (1,'Members',1,'2018-03-16 13:01:14.912051',1),(2,'Staff',1,'2018-03-16 13:01:14.912051',1),(3,'Board Members',1,'2018-03-16 13:01:14.912051',1);

--
-- Dumping data for table `logs`
--

INSERT INTO `logs` (`log_id`,`log_summary`,`log_organization`,`log_reference`,`log_time`,`log_balance`) VALUES (1,'{\"payments\": [{\"services\": [1]}]}',1,1,'2018-03-16 13:01:14.912051',10);

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`member_id`,`name.first`,`name.last`,`account.name`,`account.balance`,`organization`,`email`,`password`,`role`,`telephone`,`joined`,`active`) VALUES (1,'User','Administrator','userAdmin',0,1,'useradmin@bixbyte.io','153797e5fc6433812172aa8d47ec69e1','admin','725678447','2018-03-16 13:01:14.912051',1);

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`pay_method_id`,`pay_method_name`,`pay_method_fee`,`pay_method_added`,`pay_method_active`) VALUES (1,'Card',0,'2018-03-16 13:01:14.912051',1),(2,'Mpesa',0,'2018-03-16 13:01:14.912051',1),(3,'Cash',0,'2018-03-16 13:01:14.912051',1),(4,'Cheque',0,'2018-03-16 13:01:14.912051',1);

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`pay_id`,`pay_org`,`pay_amount`,`pay_method`,`pay_services`,`pay_token`,`pay_message`,`pay_added`,`pay_active`) VALUES (1,1,10,1,'{\"payments\": [{\"services\": [1]}]}','bixbyte','10 logged Complementary SMS messages','2018-03-16 13:01:14.912051',1);

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`,`service_name`,`service_fee`,`service_code`,`service_added`,`service_active`) VALUES (1,'SMS',0,'BX_SMS','2018-03-16 13:01:14.912051',1);

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`sub_id`,`sub_org`,`sub_service`,`sub_added`,`sub_active`) VALUES (1,1,1,'2018-03-16 13:01:14.912051',1);

--
-- Dumping data for table `templates`
--

INSERT INTO `templates` (`t_id`,`t_name`,`t_organization`,`t_added`,`t_active`) VALUES (0,'The main bulk sms template  is this',1,'2018-03-16 13:01:14.912051',1);
INSERT INTO `templates` (`t_id`,`t_name`,`t_organization`,`t_added`,`t_active`) VALUES (1,'This is but a sample SMS template. Edit me as you see fit',1,'2018-03-16 13:01:14.912051',1);

--
-- Dumping data for table `group_members`
--

INSERT INTO `group_members` (`mem_id`,`mem_name`,`mem_user`,`mem_phone`,`mem_email`,`mem_group`,`mem_added`,`mem_active`) VALUES (1,'Ian Innocent','ianmin2','0725678447','ianmin2@live.com',1,'2018-03-16 13:01:14.912051',1);


