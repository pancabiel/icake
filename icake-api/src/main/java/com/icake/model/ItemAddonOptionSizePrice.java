package com.icake.model;

import jakarta.persistence.*;

@Entity
@Table(name = "item_addon_option_size_prices")
public class ItemAddonOptionSizePrice extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    private ItemAddonOption option;

    // The SIZE addon option that acts as the threshold (e.g. "25cm")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_option_id", nullable = false)
    private ItemAddonOption sizeOption;

    @Column(name = "price_delta", nullable = false)
    private double priceDelta = 0.0;

    public ItemAddonOption getOption() {
        return option;
    }

    public void setOption(ItemAddonOption option) {
        this.option = option;
    }

    public ItemAddonOption getSizeOption() {
        return sizeOption;
    }

    public void setSizeOption(ItemAddonOption sizeOption) {
        this.sizeOption = sizeOption;
    }

    public double getPriceDelta() {
        return priceDelta;
    }

    public void setPriceDelta(double priceDelta) {
        this.priceDelta = priceDelta;
    }
}
