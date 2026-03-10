-- V2__catalog_addons.sql
-- Run this if you're using Flyway. Otherwise execute manually.

-- 1. Categories
CREATE TABLE categories (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    emoji      VARCHAR(10),
    sort_order INT          NOT NULL DEFAULT 0,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at DATETIME,
    updated_at DATETIME
);

-- 2. Add new columns to existing items table
ALTER TABLE items
    ADD COLUMN category_id BIGINT,
    ADD COLUMN emoji       VARCHAR(10),
    ADD COLUMN unit        VARCHAR(50)  NOT NULL DEFAULT 'unidade',
    ADD COLUMN min_qty     INT          NOT NULL DEFAULT 1,
    ADD COLUMN active      BOOLEAN      NOT NULL DEFAULT TRUE,
    ADD CONSTRAINT fk_item_category FOREIGN KEY (category_id) REFERENCES categories (id);

-- 3. Addon groups (e.g. "Massa", "Recheio", "Extras")
CREATE TABLE item_addons (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id        BIGINT       NOT NULL,
    label          VARCHAR(100) NOT NULL,
    type           VARCHAR(10)  NOT NULL DEFAULT 'SINGLE',
    required       BOOLEAN      NOT NULL DEFAULT FALSE,
    max_selections INT,
    created_at     DATETIME,
    updated_at     DATETIME,
    CONSTRAINT fk_addon_item FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
);

-- 4. Addon options (e.g. "Chocolate +R$0", "Red Velvet +R$15")
CREATE TABLE item_addon_options (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    addon_id    BIGINT        NOT NULL,
    label       VARCHAR(100)  NOT NULL,
    price_delta DOUBLE        NOT NULL DEFAULT 0.0,
    active      BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  DATETIME,
    updated_at  DATETIME,
    CONSTRAINT fk_option_addon FOREIGN KEY (addon_id) REFERENCES item_addons (id) ON DELETE CASCADE
);

-- 5. Seed initial categories (matching the prototype)
INSERT INTO categories (name, emoji, sort_order, active) VALUES
    ('Bolos',        '🎂', 1, TRUE),
    ('Brigadeiros',  '🍫', 2, TRUE),
    ('Tortas',       '🥧', 3, TRUE);