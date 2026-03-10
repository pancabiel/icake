package com.icake.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "item_addon_options")
public class ItemAddonOption extends BaseEntity {

	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "addon_id", nullable = false)
	private ItemAddon addon;

	// Display label, e.g. "Chocolate", "Red Velvet"
	@Column(nullable = false)
	private String label;

	// Price difference from the base item price (can be negative, e.g. Naked Cake = -10.0)
	@Column(name = "price_delta")
	private double priceDelta = 0.0;

	private boolean active = true;

	public ItemAddon getAddon() {
		return addon;
	}

	public void setAddon(ItemAddon addon) {
		this.addon = addon;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public double getPriceDelta() {
		return priceDelta;
	}

	public void setPriceDelta(double priceDelta) {
		this.priceDelta = priceDelta;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}
}