-- ORGANIZATIONS --
IF EXISTS( SELECT * FROM organizations  )   DROP TABLE  organizations;
CREATE TABLE organizations (
    org_id          text  PRIMARY KEY,
    org_name        varchar(500)         CONSTRAINT unique_organization_name_required UNIQUE,
    org_telephone   varchar(500)         CONSTRAINT unique_organization_telephone_required UNIQUE,
    org_email       varchar(500)         CONSTRAINT unique_organization_email_required UNIQUE,
    org_code        varchar(25)  CONSTRAINT unique_organization_code_required UNIQUE,
    org_added       DATETIMEOFFSET    DEFAULT GETDATE(),
    org_active           DEFAULT 1
);
INSERT INTO organizations 
(org_id,org_name,org_telephone,org_email,org_code) 
VALUES
(1,'Bixbyte Solutions','+254725678447','info@bixbyte.io','pm_bx_001');


-- AUD_ORGANIZATIONS --
IF EXISTS( SELECT * FROM   aud_organizations )   DROP TABLE  aud_organizations;
CREATE TABLE aud_organizations (
    org_id          bigint      ,
    org_name        varchar(500)        ,
    org_telephone   varchar(500)        ,
    org_email       varchar(500)        ,
    org_code        varchar(25) ,
    org_added       DATETIMEOFFSET    DEFAULT GETDATE(),
    org_active      bit     DEFAULT 0,
    func            varchar(15)
);


--- ORGANIZATIONS
IF OBJECT_ID('audit_organizations', 'FN') IS NOT NULL
  DROP FUNCTION audit_organizations;
GO

CREATE FUNCTION audit_organizations()
    RETURNS trigger AS
 BEGIN
DECLARE @$BODY$
BEGIN 
    IF (TG_OP = 'DELETE') BEGIN
        INSERT INTO aud_organizations (org_id,org_name,org_telephone,org_email,org_code,org_added,org_active,func) 
        SELECT OLD.org_id,OLD.org_name,OLD.org_telephone,OLD.org_email,OLD.org_code,OLD.org_added,OLD.org_active,TG_OP;
        RETURN OLD;
    END 
    RETURN NULL;
    END;
    IF (TG_OP = 'INSERT') BEGIN
        -- INSERT INTO aud_organizations (org_id,org_name,org_telephone,org_email,org_code,org_added,org_active,func) 
        -- SELECT NEW.org_id,NEW.org_name,NEW.org_telephone,NEW.org_email,NEW.org_code,NEW.org_added,NEW.org_active,TG_OP;
        RETURN NEW;
    END 
    IF (TG_OP = 'UPDATE') BEGIN
        INSERT INTO aud_organizations (org_id,org_name,org_telephone,org_email,org_code,org_added,org_active,func) 
        SELECT OLD.org_id,OLD.org_name,OLD.org_telephone,OLD.org_email,OLD.org_code,getdate(),OLD.org_active,TG_OP;
        RETURN NEW;
    END 
END;
$BODY$
LANGUAGE plpgsql VOLATILE;


-- ORGANIZATIONS
CREATE TRIGGER organizations_audit  INSTEAD OF UPDATE OR AS INSERT OR DELETE
   ON organizations FOR EACH ROW
EXECUTE PROCEDURE audit_organizations();

--- ORGANIZATIONS ---
DROP VIEW IF EXISTS vw_organizations;
CREATE VIEW vw_organizations AS 
SELECT org_id,org_name,org_telephone,org_email,org_code,org_added,org_active
FROM organizations;

--==========================================================================================================


-- SERVICES --
IF EXISTS( SELECT * FROM   services )   DROP TABLE  services;
CREATE TABLE services (
    service_id      bigint   identity(1, 1)  PRIMARY KEY,
    service_name    varchar(500)        CONSTRAINT  unique_service_name_required UNIQUE NOT NULL,
    service_fee     bigint      CONSTRAINT  service_fee_required NOT NULL,
    service_code    varchar(500)        CONSTRAINT  unique_service_coed_required UNIQUE NOT NULL,
    service_added   DATETIMEOFFSET    DEFAULT     GETDATE(),
    service_active  bit     DEFAULT   1
);
INSERT INTO services 
(service_name,service_fee,service_code)
VALUES
('SMS',0,'BX_SMS');

-- AUD_SERVICES --
IF EXISTS( SELECT * FROM  aud_services  )   DROP TABLE  aud_services;
CREATE TABLE aud_services (
    service_id      bigint      ,
    service_name    varchar(500)        ,
    service_fee     bigint      ,
    service_code    varchar(500)        ,
    service_added   DATETIMEOFFSET    DEFAULT     GETDATE(),
    service_active  bit     DEFAULT   1,
    func            varchar(15)
);


--- SERVICES 
IF OBJECT_ID('audit_services', 'FN') IS NOT NULL
  DROP FUNCTION audit_services;
GO

CREATE FUNCTION audit_services()
    RETURNS trigger AS
 BEGIN
DECLARE @$BODY$
BEGIN 
    IF (TG_OP = 'DELETE') BEGIN
        INSERT INTO aud_services (service_id,service_name,service_fee,service_code,service_added,service_active,func) 
        SELECT OLD.service_id,OLD.service_name,OLD.service_fee,OLD.service_code,OLD.service_added,OLD.service_active,TG_OP;
        RETURN OLD;
    END 
    RETURN NULL;
    END;
    IF (TG_OP = 'INSERT') BEGIN
        -- INSERT INTO aud_services (service_id,service_name,service_fee,service_code,service_added,service_active,func) 
        -- SELECT NEW.service_id,NEW.service_name,NEW.service_fee,NEW.service_code,NEW.service_added,NEW.service_active,TG_OP;
        RETURN NEW;
    END 
    IF (TG_OP = 'UPDATE') BEGIN
        INSERT INTO aud_services (service_id,service_name,service_fee,service_code,service_added,service_active,func) 
        SELECT OLD.service_id,OLD.service_name,OLD.service_fee,OLD.service_code,OLD.service_added,OLD.service_active,TG_OP;
        RETURN NEW;
    END 
END;
$BODY$
LANGUAGE plpgsql VOLATILE;

-- SERVICES
CREATE TRIGGER services_audit  INSTEAD OF UPDATE OR AS INSERT OR DELETE
   ON services FOR EACH ROW
EXECUTE PROCEDURE audit_services();


--- SERVICES ---
DROP VIEW IF EXISTS vw_services;
CREATE VIEW vw_services AS 
SELECT service_id,service_name,service_code,service_added,service_active
FROM services;




--==========================================================================================================

-- SUBSCRIPTIONS --
IF EXISTS( SELECT * FROM   subscriptions )   DROP TABLE  subscriptions;
CREATE TABLE subscriptions (
    sub_id          bigint       identity(1, 1)  PRIMARY KEY,
    sub_org         bigint          NOT NULL CONSTRAINT organization_id_required        REFERENCES organizations( org_id ),
    sub_service     bigint          NOT NULL CONSTRAINT service_subscription_required   REFERENCES services( service_id ),
    sub_added       DATETIMEOFFSET        DEFAULT GETDATE(),
    sub_active      bit         DEFAULT  1
);
INSERT INTO subscriptions
(sub_org,sub_service)
VALUES
(1,1);

-- AUD_SUBSCRIPTIONS --
IF EXISTS( SELECT * FROM  aud_subscriptions  )   DROP TABLE  aud_subscriptions;
CREATE TABLE aud_subscriptions (
    sub_id          bigint          ,
    sub_org         bigint          ,
    sub_service     bigint          ,
    sub_added       DATETIMEOFFSET        DEFAULT GETDATE(),
    sub_active      bit          DEFAULT  1,
    func            varchar(15)
);


--- SUBSCRIPTIONS
IF OBJECT_ID('audit_subscriptions', 'FN') IS NOT NULL
  DROP FUNCTION audit_subscriptions;
GO

CREATE FUNCTION audit_subscriptions()
    RETURNS trigger AS
 BEGIN
DECLARE @$BODY$
BEGIN 
    IF (TG_OP = 'DELETE') BEGIN
        INSERT INTO aud_subscriptions (sub_id,sub_org,sub_service,sub_added,sub_active,func) 
        SELECT OLD.sub_id,OLD.sub_org,OLD.sub_service,OLD.sub_added,OLD.sub_active,TG_OP;
        RETURN OLD;
    END 
    RETURN NULL;
    END;
    IF (TG_OP = 'INSERT') BEGIN
        -- INSERT INTO aud_subscriptions (sub_id,sub_org,sub_service,sub_added,sub_active,func) 
        -- SELECT NEW.sub_id,NEW.sub_org,NEW.sub_service,NEW.sub_added,NEW.sub_active,TG_OP;
        RETURN NEW;
    END 
    IF (TG_OP = 'UPDATE') BEGIN
        INSERT INTO aud_subscriptions (sub_id,sub_org,sub_service,sub_added,sub_active,func) 
        SELECT OLD.sub_id,OLD.sub_org,OLD.sub_service,OLD.sub_added,OLD.sub_active,TG_OP;
        RETURN NEW;
    END 
END;
$BODY$
LANGUAGE plpgsql VOLATILE;


-- SUBSCRIPTIONS
CREATE TRIGGER subscriptions_audit  INSTEAD OF UPDATE OR AS INSERT OR DELETE
   ON subscriptions FOR EACH ROW
EXECUTE PROCEDURE audit_subscriptions();


--- SUBSCRIPTIONS ---
DROP VIEW IF EXISTS vw_subscriptions;
CREATE VIEW vw_subscriptions AS 
SELECT sub_id
,sub_org,organizations.org_name as sub_org_name,organizations.org_active,organizations.org_email AS sub_org_email, organizations.org_telephone AS sub_org_telephone
,sub_service,services.service_name as sub_service_name,services.service_active
,sub_added,sub_active
FROM subscriptions
    LEFT JOIN organizations 
        ON subscriptions.sub_org        = CAST( organizations.org_id AS varchar (100))
    LEFT JOIN services
ON subscriptions.sub_service    = services.service_id;
--==========================================================================================================

-- PAYMENT_METHODS --
IF EXISTS( SELECT * FROM payment_methods   )   DROP TABLE  payment_methods;
CREATE TABLE payment_methods(
    pay_method_id          bigint       identity(1, 1)  PRIMARY KEY,
    pay_method_name        varchar(60)     NOT NULL,
    pay_method_fee         bigint          DEFAULT 0,
    pay_method_added       DATETIMEOFFSET        DEFAULT GETDATE(),
    pay_method_active      bit          DEFAULT 1
);
INSERT INTO payment_methods 
(pay_method_name) 
VALUES 
('Card'),('Mpesa'),('Cash'),('Cheque');


-- AUD_PAYMENT_METHODS --
IF EXISTS( SELECT * FROM   aud_payment_methods )   DROP TABLE  aud_payment_methods;
CREATE TABLE aud_payment_methods(
    pay_method_id          bigint          ,
    pay_method_name        varchar(60)     ,
    pay_method_fee         bigint          DEFAULT 0,
    pay_method_added       DATETIMEOFFSET        DEFAULT GETDATE(),
    pay_method_active      bit          DEFAULT 1,
    func            varchar(15)
);

--- PAYMENT_METHODS
IF OBJECT_ID('audit_payment_methods', 'FN') IS NOT NULL
  DROP FUNCTION audit_payment_methods;
GO

CREATE FUNCTION audit_payment_methods()
    RETURNS trigger AS
 BEGIN
DECLARE @$BODY$
BEGIN 
    IF (TG_OP = 'DELETE') BEGIN
        INSERT INTO aud_payment_methods (pay_method_id,pay_method_name,pay_method_fee,pay_method_added,pay_method_active,func) 
        SELECT OLD.pay_method_id,OLD.pay_method_name,OLD.pay_method_fee,OLD.pay_method_added,OLD.pay_method_active,TG_OP;
        RETURN OLD;
    END 
    RETURN NULL;
    END;
    IF (TG_OP = 'INSERT') BEGIN
        -- INSERT INTO aud_payment_methods (pay_method_id,pay_method_name,pay_method_fee,pay_method_added,pay_method_active,func) 
        -- SELECT NEW.pay_method_id,NEW.pay_method_name,NEW.pay_method_fee,NEW.pay_method_added,NEW.pay_method_active,TG_OP;
        RETURN NEW;
    END 
    IF (TG_OP = 'UPDATE') BEGIN
        INSERT INTO aud_payment_methods (pay_method_id,pay_method_name,pay_method_fee,pay_method_added,pay_method_active,func) 
        SELECT OLD.pay_method_id,OLD.pay_method_name,OLD.pay_method_fee,OLD.pay_method_added,OLD.pay_method_active,TG_OP;
        RETURN NEW;
    END 
END;
$BODY$
LANGUAGE plpgsql VOLATILE;

-- PAYMENT_METHODS
CREATE TRIGGER payment_methods_audit  INSTEAD OF UPDATE OR AS INSERT OR DELETE
   ON payment_methods FOR EACH ROW
EXECUTE PROCEDURE audit_payment_methods();


--- PAYMENT_METHODS ---
DROP VIEW IF EXISTS vw_payment_methods;
CREATE VIEW vw_payment_methods AS 
SELECT pay_method_id,pay_method_name,pay_method_fee,pay_method_added,pay_method_active
FROM payment_methods;


--==========================================================================================================

-- PAYMENTS --
IF EXISTS( SELECT * FROM  payments  )   DROP TABLE  payments;
CREATE TABLE payments (
    pay_id          bigint       identity(1, 1)  PRIMARY KEY,
    pay_org         text         CONSTRAINT valid_organization_required REFERENCES organizations( org_id ),
    pay_amount      bigint          NOT NULL,
    pay_method      bigint          NOT NULL CONSTRAINT valid_pay_method_required REFERENCES payment_methods( pay_method_id ),
    pay_services    text           NOT NULL,
    pay_token       varchar(500)            NOT NULL CONSTRAINT token_not_used UNIQUE,
    pay_message     varchar(500),
    pay_added       DATETIMEOFFSET        DEFAULT GETDATE(),
    pay_active      bit         DEFAULT 1
);



-- AUD_PAYMENTS --
IF EXISTS( SELECT * FROM  aud_payments  )   DROP TABLE  aud_payments;
CREATE TABLE aud_payments (
    pay_id          bigint       ,
    pay_org         text       ,
    pay_amount      bigint       ,
    pay_method      bigint       ,
    pay_services    text         ,
    pay_token       varchar(500),
    pay_message     varchar(500),
    pay_added       DATETIMEOFFSET        DEFAULT GETDATE(),
    pay_active      bit ,
    func            varchar(15)
);

--- PAYMENTS
IF OBJECT_ID('audit_payments', 'FN') IS NOT NULL
  DROP FUNCTION audit_payments;
GO

CREATE FUNCTION audit_payments()
    RETURNS trigger AS
 BEGIN
DECLARE @$BODY$
DECLARE 
    _log_balance
    Return null;
    End;        bigint;
    _new_balance        bigint;
BEGIN 
    IF (TG_OP = 'DELETE') BEGIN
        INSERT INTO aud_payments (pay_id,pay_org,pay_amount,pay_method,pay_services,pay_token,pay_message,pay_added,pay_active,func) 
        SELECT OLD.pay_id,OLD.pay_org,OLD.pay_amount,OLD.pay_method,OLD.pay_services,OLD.pay_token,OLD.pay_message,OLD.pay_added,OLD.pay_active,TG_OP;
        RETURN OLD;
    END 
    IF (TG_OP = 'INSERT') BEGIN
           SELECT @_log_balance = log_balance FROM logs WHERE log_organization = NEW.pay_org ORDER BY log_id DESC;
           
            IF _log_balance IS NULL BEGIN
               INSERT INTO logs (log_summary,log_organization,log_balance,log_reference) VALUES ( NEW.pay_services,NEW.pay_org, NEW.pay_amount,NEW.pay_id );
            END
            ELSE BEGIN 
                INSERT INTO logs (log_summary,log_organization,log_balance,log_reference) VALUES ( NEW.pay_services,NEW.pay_org, _log_balance+NEW.pay_amount, NEW.pay_id );
            END 
        -- INSERT INTO aud_payments (pay_id,pay_org,pay_amount,pay_method,pay_services,pay_token,pay_message,pay_added,pay_active,func) 
        -- SELECT NEW.pay_id,NEW.pay_org,NEW.pay_amount,NEW.pay_method,NEW.pay_services,NEW.pay_token,NEW.pay_message,NEW.pay_added,NEW.pay_active,TG_OP;
        RETURN NEW;
    END 
    IF (TG_OP = 'UPDATE') BEGIN
        INSERT INTO aud_payments (pay_id,pay_org,pay_amount,pay_method,pay_services,pay_token,pay_message,pay_added,pay_active,func) 
        SELECT OLD.pay_id,OLD.pay_org,OLD.pay_amount,OLD.pay_method,OLD.pay_services,OLD.pay_token,OLD.pay_message,OLD.pay_added,OLD.pay_active,TG_OP;
        RETURN NEW;
    END 
END;
$BODY$
LANGUAGE plpgsql VOLATILE;

-- PAYMENTS
CREATE TRIGGER payments_audit  INSTEAD OF UPDATE OR AS INSERT OR DELETE
   ON payments FOR EACH ROW
EXECUTE PROCEDURE audit_payments();



--- VW_PAYMENTS ---
DROP VIEW IF EXISTS vw_payments;
CREATE VIEW vw_payments AS 
SELECT pay_id
,pay_org,organizations.org_name as pay_org_name, organizations.org_telephone AS pay_org_telephone, organizations.org_email AS pay_org_email
,pay_services
,pay_message,pay_added
,pay_method,payment_methods.pay_method_name
,pay_active
FROM payments 
    LEFT JOIN organizations
        ON CAST( payments.pay_org AS VARCHAR(100) )    =  CAST( organizations.org_id AS varchar(100))
    LEFT JOIN payment_methods
ON payments.pay_method =  payment_methods.pay_method_id;

--==========================================================================================================


-- MEMBERS --
IF EXISTS( SELECT * FROM  members  )   DROP TABLE  members;
CREATE TABLE members (
	member_id		bigint 	    identity(1, 1)  PRIMARY KEY,
	"name.first"    varchar(25) 	NOT NULL,
	"name.last"	    varchar(25),
    "account.name"  varchar(50)     UNIQUE NOT NULL,
    "account.balance" bigint        DEFAULT 0,
    organization    uniqueidentifier          CONSTRAINT valid_member_organization_required REFERENCES organizations( org_id ),
	email		    varchar(75) 	UNIQUE NOT NULL,
	password	    varchar(500)		    NOT NULL,
	role		    varchar(15) CHECK ( role  IN ('audit', 'client', 'admin')) NOT NULL,
	telephone	    varchar(15)	    NOT NULL,
	joined		    DATETIMEOFFSET	    DEFAULT GETDATE(),
	active 		    bit 	    DEFAULT 1
);

INSERT INTO members 
( "name.first", "name.last","account.name",email, password, role, telephone,organization ) 
VALUES
('User','Administrator','userAdmin','useradmin@bixbyte.io',CONVERT(VARCHAR(32), HashBytes('MD5', 'ianmin2'), 2),'admin', 0725678447, 1);

-- AUD_MEMBERS --
IF EXISTS( SELECT * FROM  aud_members  )   DROP TABLE  aud_members;
CREATE TABLE aud_members (
	member_id		bigint,
	"name.first"    varchar(25) 	,
	"name.last"	    varchar(25),
    "account.name"  varchar(50),
    "account.balance"  bigint,
    organization    u8niqueidentifier,
	email		    varchar(75)     ,
	password	    varchar(500)		    ,
	role		    varchar(15) CHECK ( role  IN ('audit', 'client', 'admin')) ,
	telephone	    varchar(15)	    ,
	joined		    DATETIMEOFFSET	    DEFAULT GETDATE(),
	active 		    bit  	    DEFAULT 1,
    func            varchar(15)
);


--- MEMBERS
IF OBJECT_ID('audit_members', 'FN') IS NOT NULL
  DROP FUNCTION audit_members;
GO

CREATE FUNCTION audit_members()
    RETURNS trigger AS
 BEGIN
DECLARE @$BODY$
BEGIN 
    IF (TG_OP = 'DELETE') BEGIN
        INSERT INTO aud_members (member_id,"name.first","name.last","account.name","account.balance",organization,email,password,role,telephone,joined,active,func) 
        SELECT OLD.member_id,OLD."name.first",OLD."name.last",OLD."account.name",OLD."account.balance",OLD.organization,OLD.email,OLD.password,OLD.role,OLD.telephone,OLD.joined,OLD.active,TG_OP;
        RETURN OLD;
    END 
    RETURN NULL;
    END;
    IF (TG_OP = 'INSERT') BEGIN
        -- INSERT INTO aud_members (member_id,"name.first","name.last","account.name","account.balance",organization,email,password,role,telephone,joined,active,func) 
        -- SELECT NEW.member_id,NEW."name.first",NEW."name.last",NEW."account.name",NEW."account.balance",NEW.organization,NEW.email,NEW.password,NEW.role,NEW.telephone,NEW.joined,NEW.active,TG_OP;
        RETURN NEW;
    END 
    IF (TG_OP = 'UPDATE') BEGIN
        INSERT INTO aud_members (member_id,"name.first","name.last","account.name","account.balance",organization,email,password,role,telephone,joined,active,func) 
        SELECT OLD.member_id,OLD."name.first",OLD."name.last",OLD."account.name",OLD."account.balance",OLD.organization,OLD.email,OLD.password,OLD.role,OLD.telephone,OLD.joined,OLD.active,TG_OP;
        RETURN NEW;
    END 
END;
$BODY$
LANGUAGE plpgsql VOLATILE;


-- MEMBERS
CREATE TRIGGER members_audit  INSTEAD OF UPDATE OR AS INSERT OR DELETE
   ON members FOR EACH ROW
EXECUTE PROCEDURE audit_members();

--- VW_MEMBERS ---
DROP VIEW IF EXISTS vw_members;
CREATE VIEW vw_members AS 
SELECT member_id,"name.first","name.last","account.name",email,password,role,telephone,joined,active
,organization,organizations.org_name as organization_name,organizations.org_email AS organization_email,organizations.org_telephone AS organization_telephone
FROM members
    LEFT JOIN organizations
ON members.organization =  CAST( organizations.org_id AS varchar(100));

--- VW_INACTIVE_MEMBERS ---
DROP VIEW IF EXISTS vw_inactive_members;
CREATE VIEW vw_inactive_members AS 
SELECT  member_id,"name.first","name.last","account.name",email
,role,telephone,joined,active
,organization,organization_name,organization_email,organization_telephone FROM vw_members 
WHERE active = 0;

--- VW_MEMBER_INFO ---
DROP VIEW IF EXISTS vw_member_info;
CREATE VIEW vw_member_info AS
SELECT member_id,"name.first","name.last","account.name",email
,role,telephone,joined,active
,organization,organization_name,organization_email,organization_telephone
FROM vw_members;

--==========================================================================================================

--- PASSWORD_RECOVERY --
IF EXISTS( SELECT * FROM  password_recovery  )   DROP TABLE  password_recovery;
CREATE TABLE password_recovery (
    password_recovery_id                    bigint identity(1, 1)  PRIMARY KEY
    ,member                                 bigint NOT NULL CONSTRAINT valid_member_required REFERENCES members(member_id)
    ,recovery_key                           varchar(500)
    ,requested                              DATETIMEOFFSET DEFAULT GETDATE()
    ,used                                   bit DEFAULT 0
    ,used_at                                DATETIMEOFFSET
);

--- AUD_PASSWORD_RECOVERY --
IF EXISTS( SELECT * FROM  aud_password_recovery  )   DROP TABLE  aud_password_recovery;
CREATE TABLE aud_password_recovery (
    password_recovery_id                    bigint
    ,member                                 bigint
    ,recovery_key                           varchar(500)
    ,requested                              DATETIMEOFFSET
    ,used                                   bit 
    ,used_at                                DATETIMEOFFSET
    ,func                                   varchar(15)
);

--- PASSWORD_RECOVERY TRIGGER FUNCTION
IF OBJECT_ID('audit_password_recovery', 'FN') IS NOT NULL
  DROP FUNCTION audit_password_recovery;
GO

CREATE FUNCTION audit_password_recovery()
    RETURNS trigger AS
 BEGIN
DECLARE @$BODY$
BEGIN 
    IF (TG_OP = 'DELETE') BEGIN
        INSERT INTO aud_password_recovery (password_recovery_id,member,recovery_key,requested,used,used_at,func) 
        SELECT OLD.password_recovery_id,OLD.member,OLD.recovery_key,OLD.requested,OLD.used,OLD.used_at,TG_OP;
        RETURN OLD;
    END 
    RETURN NULL;
    END;
    IF (TG_OP = 'INSERT') BEGIN
        -- INSERT INTO aud_password_recovery (password_recovery_id,member,recovery_key,requested,used,used_at,func) 
        -- SELECT NEW.password_recovery_id,NEW.member,NEW.recovery_key,NEW.requested,NEW.used,NEW.used_at,TG_OP;
        RETURN NEW;
    END 
    IF (TG_OP = 'UPDATE') BEGIN
        INSERT INTO aud_password_recovery (password_recovery_id,member,recovery_key,requested,used,used_at,func) 
        SELECT OLD.password_recovery_id,OLD.member,OLD.recovery_key,OLD.requested,OLD.used,OLD.used_at,TG_OP;
        SET @NEW.used_at = getdate();
        SET @NEW.used = 1;
        RETURN NEW;
    END 
END;
$BODY$
LANGUAGE plpgsql VOLATILE;


-- PASSWORD_RECOVERY AUDIT TRIGGER
CREATE TRIGGER password_recovery_audit  INSTEAD OF UPDATE OR AS INSERT OR DELETE
   ON password_recovery FOR EACH ROW
EXECUTE PROCEDURE audit_password_recovery();

-- VW_PASSWORD_RECOVERY
DROP VIEW IF EXISTS vw_password_recovery;
CREATE VIEW vw_password_recovery AS 
SELECT password_recovery_id,recovery_key
,member ,members."name.first" AS member_first_name ,members."name.last" AS member_last_name ,members.telephone AS member_telephone ,members.email AS member_email ,members.role AS member_role
FROM password_recovery
    LEFT JOIN members
        ON password_recovery.member         = members.member_id
WHERE password_recovery.used = 0;


--==========================================================================================================

-- GROUPS --
IF EXISTS( SELECT * FROM groups   )   DROP TABLE  groups;
CREATE TABLE groups (
    group_id           bigint   identity(1, 1)  PRIMARY KEY
    ,group_name        varchar(500)        NOT NULL CONSTRAINT unique_group_name_required UNIQUE
    ,group_organization  varchar(100) NOT NULL
    ,group_added       DATETIMEOFFSET    DEFAULT GETDATE()
    ,group_active      bit     DEFAULT 1
);
INSERT INTO groups 
( group_name,group_organization) 
VALUES
('Members',1),('Staff',1),('Board Members',1);


-- AUD_GROUPS --
IF EXISTS( SELECT * FROM  aud_groups  )   DROP TABLE  aud_groups;
CREATE TABLE aud_groups (
    group_id           bigint      
    ,group_name        varchar(500)   
    ,group_organization bigint     
    ,group_added       DATETIMEOFFSET    DEFAULT GETDATE()
    ,group_active      bit     DEFAULT 0
    ,func              varchar(15)
);


--- AUDIT_GROUPS
IF OBJECT_ID('audit_groups', 'FN') IS NOT NULL
  DROP FUNCTION audit_groups;
GO

CREATE FUNCTION audit_groups()
    RETURNS trigger AS
 BEGIN
DECLARE @$BODY$
BEGIN 
    IF (TG_OP = 'DELETE') BEGIN
        INSERT INTO aud_groups (group_id,group_name,group_organization,group_added,group_active,func) 
        SELECT OLD.group_id,OLD.group_name,OLD.group_organization,OLD.group_added,OLD.group_active,TG_OP;
        RETURN OLD;
    END 
    RETURN NULL;
    END;
    IF (TG_OP = 'INSERT') BEGIN
        -- INSERT INTO aud_groups (group_id,group_name,group_organization,group_added,group_active,func) 
        -- SELECT NEW.group_id,NEW.group_name,NEW.group_organization,NEW.group_added,NEW.group_active,TG_OP;
        RETURN NEW;
    END 
    IF (TG_OP = 'UPDATE') BEGIN
        INSERT INTO aud_groups (group_id,group_name,group_organization,group_added,group_active,func) 
        SELECT OLD.group_id,OLD.group_name,OLD.group_organization,OLD.group_added,OLD.group_active,TG_OP;
        SET @NEW.group_added=getdate();
        RETURN NEW;
    END 
END;
$BODY$
LANGUAGE plpgsql VOLATILE;


-- GROUPS_AUDIT
CREATE TRIGGER groups_audit  INSTEAD OF UPDATE OR AS INSERT OR DELETE
   ON groups FOR EACH ROW
EXECUTE PROCEDURE audit_groups();

--- VW_GROUPS ---
DROP VIEW IF EXISTS vw_groups;
CREATE VIEW vw_groups AS 
SELECT group_id,group_name,group_added,group_active
,group_organization ,organizations.org_name AS group_organization_name ,organizations.org_telephone AS group_organization_telephone ,organizations.org_email AS group_organization_email, organizations.org_active AS group_organization_active
FROM groups
    LEFT JOIN organizations 
        ON groups.group_organization  = CAST( organizations.org_id AS varchar(100));


--==========================================================================================================

-- GROUP_MEMBERS --
IF EXISTS( SELECT * FROM  group_members  )   DROP TABLE  group_members;
CREATE TABLE group_members (
    mem_id              bigint   identity(1, 1)  PRIMARY KEY
    ,mem_name           varchar(55)        
    ,mem_user           varchar(500)
    ,mem_phone          varchar(500)  CONSTRAINT group_member_phone_required NOT NULL
    ,mem_email          varchar(50) -- CONSTRAINT group_member_email_required NOT NULL
    ,mem_group          bigint  NOT NULL  CONSTRAINT mem_group_reqired REFERENCES groups(group_id)
    ,mem_added          DATETIMEOFFSET    DEFAULT GETDATE()
    ,mem_active         bit     DEFAULT 1
    -- ,CONSTRAINT unique_user_per_group UNIQUE(mem_user,mem_group)
    ,CONSTRAINT unique_email_per_group UNIQUE(mem_email,mem_group)
    ,CONSTRAINT unique_telephone_per_group UNIQUE(mem_phone,mem_group)
);
INSERT INTO group_members
( mem_name,mem_group,mem_phone,mem_email,mem_user) 
VALUES
('Ian Innocent',1,'0725678447','ianmin2@live.com','ianmin2');


-- AUD_GROUP_MEMBERS --
IF EXISTS( SELECT * FROM  aud_group_members  )   DROP TABLE  aud_group_members;
CREATE TABLE aud_group_members (
    mem_id              bigint
    ,mem_name           varchar(55)        
    ,mem_user           varchar(500)
    ,mem_phone          varchar(500) -- CONSTRAINT group_member_phone_required NOT NULL
    ,mem_email          varchar(50) -- CONSTRAINT group_member_email_required NOT NULL
    ,mem_group          bigint
    ,mem_added          DATETIMEOFFSET    DEFAULT GETDATE()
    ,mem_active         bit     DEFAULT 1
    ,func              varchar(15)
);

--- AUDIT_GROUP_MEMBERS
IF OBJECT_ID('audit_group_members', 'FN') IS NOT NULL
  DROP FUNCTION audit_group_members;
GO

CREATE FUNCTION audit_group_members()
    RETURNS trigger AS
 BEGIN
DECLARE @$BODY$
BEGIN 
    IF (TG_OP = 'DELETE') BEGIN
        INSERT INTO aud_group_members (mem_id,mem_name,mem_user,mem_phone,mem_email,mem_group,mem_added,mem_active,func) 
        SELECT OLD.mem_id,OLD.mem_name,OLD.mem_user,OLD.mem_phone,OLD.mem_email,OLD.mem_group,OLD.mem_added,OLD.mem_active,TG_OP;
        RETURN OLD;
    END 
    RETURN NULL;
    END;
    IF (TG_OP = 'INSERT') BEGIN
        -- INSERT INTO aud_group_members (mem_id,mem_name,mem_user,mem_phone,mem_email,mem_group,mem_added,mem_active,func) 
        -- SELECT NEW.mem_id,NEW.mem_name,NEW.mem_user,NEW.mem_phone,NEW.mem_email,NEW.mem_group,NEW.mem_added,NEW.mem_active,TG_OP;
        RETURN NEW;
    END 
    IF (TG_OP = 'UPDATE') BEGIN
        INSERT INTO aud_group_members (mem_id,mem_name,mem_user,mem_phone,mem_email,mem_group,mem_added,mem_active,func) 
        SELECT OLD.mem_id,OLD.mem_name,OLD.mem_user,OLD.mem_phone,OLD.mem_email,OLD.mem_group,OLD.mem_added,OLD.mem_active,TG_OP;
        SET @NEW.mem_added = getdate();
        RETURN NEW;
    END 
END;
$BODY$
LANGUAGE plpgsql VOLATILE;


-- GROUP_MEMBERS_AUDIT
CREATE TRIGGER group_members_audit  INSTEAD OF UPDATE OR AS INSERT OR DELETE
   ON group_members FOR EACH ROW
EXECUTE PROCEDURE audit_group_members();

--- VW_GROUP_MEMBERS ---
DROP VIEW IF EXISTS vw_group_members;
CREATE VIEW vw_group_members AS 
SELECT mem_id,mem_name,mem_user,mem_phone,mem_email,mem_added,mem_active
,mem_group ,groups.group_name AS mem_group_name ,groups.group_organization AS mem_organization
,organizations.org_name AS mem_organization_name ,organizations.org_telephone AS mem_organization_telephone ,organizations.org_email AS mem_organization_email, organizations.org_active AS mem_organization_active
FROM group_members
    LEFT JOIN groups 
        ON group_members.mem_group              = groups.group_id
    LEFT JOIN organizations 
        ON groups.group_organization            = CAST( organizations.org_id AS varchar(100));


--- VW_GROUPED_MEMBERS ---
DROP VIEW IF EXISTS vw_grouped_members;
CREATE VIEW vw_grouped_members AS 
SELECT mem_group_name AS group_name, mem_group AS group_id,  mem_phone AS group_members
FROM vw_group_members
WHERE       mem_active                  = 1
AND         mem_organization_active     = 1
GROUP BY    mem_group_name , mem_group,mem_phone;


--==========================================================================================================


-- TEMPLATES --
IF EXISTS( SELECT * FROM templates   )   DROP TABLE  templates;
CREATE TABLE templates (
    t_id           bigint   identity(1, 1)  PRIMARY KEY
    ,t_name        varchar(500)        NOT NULL CONSTRAINT unique_template_name_required UNIQUE
    ,t_organization bigint     NOT NULL CONSTRAINT valid_template_organization_reqired REFERENCES organizations(org_id)
    ,t_added       DATETIMEOFFSET    DEFAULT GETDATE()
    ,t_active      bit     DEFAULT 1
);

INSERT INTO templates
(t_name,t_organization)
VALUES 
('The main bulk sms template  is this',1)
,('This is but a sample SMS template. Edit me as you see fit',1);


-- AUD_TEMPLATES --
IF EXISTS( SELECT * FROM  aud_templates  )   DROP TABLE  aud_templates;
CREATE TABLE aud_templates (
    t_id           bigint      
    ,t_name        varchar(500)   
    ,t_organization bigint     
    ,t_added       DATETIMEOFFSET    DEFAULT GETDATE()
    ,t_active      bit     DEFAULT 0
    ,func              varchar(15)
);


--- AUDIT_TEMPLATES
IF OBJECT_ID('audit_templates', 'FN') IS NOT NULL
  DROP FUNCTION audit_templates;
GO

CREATE FUNCTION audit_templates()
    RETURNS trigger AS
 BEGIN
DECLARE @$BODY$
BEGIN 
    IF (TG_OP = 'DELETE') BEGIN
        INSERT INTO aud_templates (t_id,t_name,t_organization,t_added,t_active,func) 
        SELECT OLD.t_id,OLD.t_name,OLD.t_organization,OLD.t_added,OLD.t_active,TG_OP;
        RETURN OLD;
    END 
    RETURN NULL;
    END;
    IF (TG_OP = 'INSERT') BEGIN
        -- INSERT INTO aud_templates (t_id,t_name,t_organization,t_added,t_active,func) 
        -- SELECT NEW.t_id,NEW.t_name,NEW.t_organization,NEW.t_added,NEW.t_active,TG_OP;
        RETURN NEW;
    END 
    IF (TG_OP = 'UPDATE') BEGIN
        INSERT INTO aud_templates (t_id,t_name,t_organization,t_added,t_active,func) 
        SELECT OLD.t_id,OLD.t_name,OLD.t_organization,OLD.t_added,OLD.t_active,TG_OP;
        SET @NEW.t_added = getdate();
        RETURN NEW;
    END 
END;
$BODY$
LANGUAGE plpgsql VOLATILE;


-- TEMPLATES_AUDIT
CREATE TRIGGER templates_audit  INSTEAD OF UPDATE OR AS INSERT OR DELETE
   ON templates FOR EACH ROW
EXECUTE PROCEDURE audit_templates();

--- VW_TEMPLATES ---
DROP VIEW IF EXISTS vw_templates;
CREATE VIEW vw_templates AS 
SELECT t_id,t_name,t_added,t_active
,t_organization ,organizations.org_name AS t_organization_name ,organizations.org_telephone AS t_organization_telephone ,organizations.org_email AS organization_email, organizations.org_active AS t_organization_active
FROM templates
    LEFT JOIN organizations 
        ON templates.t_organization  = organizations.org_id;


--==========================================================================================================

-- LOGS --
IF EXISTS( SELECT * FROM  logs  )   DROP TABLE  logs;
CREATE TABLE logs (
    log_id              bigint   identity(1, 1)  PRIMARY KEY
    ,log_summary        text
    ,log_organization   bigint 
    ,log_reference      bigint  NOT NULL
    ,log_time           DATETIMEOFFSET DEFAULT GETDATE()
    ,log_balance        bigint DEFAULT 0
    ,FOREIGN KEY (log_organization) REFERENCES organizations(org_id)
);

-- AUD_LOGS --
IF EXISTS( SELECT * FROM  aud_logs  )   DROP TABLE  aud_logs;
CREATE TABLE aud_logs (
    log_id              bigint
    ,log_summary        text
    ,log_organization   bigint
    ,log_reference      bigint
    ,log_time           DATETIMEOFFSET DEFAULT GETDATE()
    ,log_balance        bigint DEFAULT 0
);

--- AUDIT_LOGS
IF OBJECT_ID('audit_logs', 'FN') IS NOT NULL
  DROP FUNCTION audit_logs;
GO

CREATE FUNCTION audit_logs()
    RETURNS trigger AS
 BEGIN
DECLARE @$BODY$
BEGIN 
    IF (TG_OP = 'DELETE') BEGIN
        INSERT INTO aud_logs (log_id,log_summary,log_organization,log_reference,log_time,log_balance,func) 
        SELECT OLD.log_id,OLD.log_summary,OLD.log_organization,OLD.log_reference,OLD.log_time,OLD.log_balance,TG_OP;
        RETURN OLD;
    END 
    RETURN NULL;
    END;
    IF (TG_OP = 'INSERT') BEGIN
        -- INSERT INTO aud_logs (log_id,log_summary,log_organization,log_reference,log_time,log_balance,func) 
        -- SELECT NEW.log_id,NEW.log_summary,NEW.log_organization,NEW.log_reference,NEW.log_time,NEW.log_balance,TG_OP;
        RETURN NEW;
    END 
    IF (TG_OP = 'UPDATE') BEGIN
        INSERT INTO aud_logs (log_id,log_summary,log_organization,log_reference,log_time,log_balance,func) 
        SELECT OLD.log_id,OLD.log_summary,OLD.log_organization,OLD.log_reference,OLD.log_time,OLD.log_balance,TG_OP;
        SET @NEW.log_time = getdate();
        RETURN NEW;
    END 
END;
$BODY$
LANGUAGE plpgsql VOLATILE;


-- LOGS_AUDIT
CREATE TRIGGER logs_audit  INSTEAD OF UPDATE OR AS INSERT OR DELETE
   ON logs FOR EACH ROW
EXECUTE PROCEDURE audit_logs();

-- VW_LOGS --
DROP VIEW IF EXISTS vw_logs;
CREATE VIEW vw_logs AS 
SELECT log_id,log_summary,log_time,log_balance
,log_organization ,organizations.org_name AS log_organization_name ,organizations.org_telephone AS log_organization_telephone ,organizations.org_email AS organization_email, organizations.org_active AS log_organization_active
,log_reference
FROM logs
    LEFT JOIN organizations 
        ON logs.log_organization  = organizations.org_id
;


INSERT INTO payments 
(pay_org,pay_amount,pay_method,pay_services,pay_message,pay_token)
VALUES
(1,10,1,'{"payments": [{"services":[1]}]}','10 logged Complementary SMS messages','bixbyte');

