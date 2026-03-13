package com.icake.dto;

public class AddonSelectionDTO {
	private Long id;
	private String label;
	private double priceDelta;

	public AddonSelectionDTO(Long id, String label, double priceDelta) {
		this.id = id;
		this.label = label;
		this.priceDelta = priceDelta;
	}

	public Long getId() {
		return id;
	}

	public String getLabel() {
		return label;
	}

	public double getPriceDelta() {
		return priceDelta;
	}
}