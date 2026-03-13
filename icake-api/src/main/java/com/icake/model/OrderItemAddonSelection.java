package com.icake.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_item_addon_selections")
public class OrderItemAddonSelection extends BaseEntity {

	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "order_item_id", nullable = false)
	private OrderItem orderItem;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "addon_option_id", nullable = false)
	private ItemAddonOption addonOption;

	public OrderItem getOrderItem() {
		return orderItem;
	}

	public void setOrderItem(OrderItem orderItem) {
		this.orderItem = orderItem;
	}

	public ItemAddonOption getAddonOption() {
		return addonOption;
	}

	public void setAddonOption(ItemAddonOption addonOption) {
		this.addonOption = addonOption;
	}
}