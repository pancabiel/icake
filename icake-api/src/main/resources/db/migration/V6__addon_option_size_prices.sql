-- Extend item_addons.type to support the new SIZE value
-- (VARCHAR column already holds the enum name as a string, no structural change needed)
-- This comment documents that 'SIZE' is now a valid value alongside 'SINGLE' and 'MULTI'.

-- Per-size price overrides for addon options.
-- Each row says: "when size option X is selected, this addon option costs price_delta instead of its default."
CREATE TABLE item_addon_option_size_prices (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    option_id      BIGINT NOT NULL,
    size_option_id BIGINT NOT NULL,
    price_delta    DOUBLE NOT NULL DEFAULT 0.0,
    created_at     DATETIME,
    updated_at     DATETIME,
    CONSTRAINT fk_size_price_option      FOREIGN KEY (option_id)      REFERENCES item_addon_options (id) ON DELETE CASCADE,
    CONSTRAINT fk_size_price_size_option FOREIGN KEY (size_option_id) REFERENCES item_addon_options (id) ON DELETE CASCADE,
    CONSTRAINT uq_size_price             UNIQUE (option_id, size_option_id)
);
