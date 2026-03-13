CREATE TABLE order_item_addon_selections (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_item_id   BIGINT NOT NULL,
    addon_option_id BIGINT NOT NULL,
    created_at      DATETIME,
    updated_at      DATETIME,
    CONSTRAINT fk_selection_order_item   FOREIGN KEY (order_item_id)   REFERENCES order_items (id) ON DELETE CASCADE,
    CONSTRAINT fk_selection_addon_option FOREIGN KEY (addon_option_id) REFERENCES item_addon_options (id)
);