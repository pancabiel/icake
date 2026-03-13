package com.icake.model;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "order_items")
public class OrderItem extends BaseEntity {

	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "order_id", nullable = false)
	private Order order;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "item_id", nullable = false)
	private Item item;

	private int quantity;

	@Column(length = 4000)
	private String note;

	@OneToMany(mappedBy = "orderItem", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<OrderItemAddonSelection> addonSelections = new HashSet<>();

	@Transient
	private List<Long> addonOptionIds;

	public Order getOrder() {
		return order;
	}

	public void setOrder(Order order) {
		this.order = order;
	}

	public Item getItem() {
		return item;
	}

	public void setItem(Item item) {
		this.item = item;
	}

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	public Set<OrderItemAddonSelection> getAddonSelections() {
		return addonSelections;
	}

	public void setAddonSelections(Set<OrderItemAddonSelection> addonSelections) {
		this.addonSelections = addonSelections;
	}

	public List<Long> getAddonOptionIds() {
		return addonOptionIds;
	}

	public void setAddonOptionIds(List<Long> addonOptionIds) {
		this.addonOptionIds = addonOptionIds;
	}
}
