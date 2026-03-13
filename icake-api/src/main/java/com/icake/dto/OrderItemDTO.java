package com.icake.dto;

import java.util.List;
import java.util.stream.Collectors;

import com.icake.model.OrderItem;

public class OrderItemDTO {
	private Long id;
	private int quantity;
	private String note;
	private ItemDTO item;
	private List<AddonSelectionDTO> addonSelections;

	public OrderItemDTO(OrderItem orderItem) {
		this.id = orderItem.getId();
		this.quantity = orderItem.getQuantity();
		this.note = orderItem.getNote();
		this.item = new ItemDTO(orderItem.getItem());
		this.addonSelections = orderItem.getAddonSelections() != null
				? orderItem.getAddonSelections().stream()
				.map(sel -> new AddonSelectionDTO(
						sel.getAddonOption().getId(),
						sel.getAddonOption().getLabel(),
						sel.getAddonOption().getPriceDelta()))
				.collect(Collectors.toList())
				: List.of();
	}

	public Long getId() {
		return id;
	}

	public ItemDTO getItem() {
		return item;
	}

	public int getQuantity() {
		return quantity;
	}

	public String getNote() {
		return note;
	}

	public List<AddonSelectionDTO> getAddonSelections() {
		return addonSelections;
	}
}