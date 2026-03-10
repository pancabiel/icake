package com.icake.model;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "item_addons")
public class ItemAddon extends BaseEntity {

	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "item_id", nullable = false)
	private Item item;

	// Display label, e.g. "Massa", "Recheio", "Extras"
	@Column(nullable = false)
	private String label;

	// SINGLE = radio buttons, MULTI = checkboxes
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private AddonType type = AddonType.SINGLE;

	private boolean required = false;

	// Max selections allowed for MULTI type (null = unlimited)
	@Column(name = "max_selections")
	private Integer maxSelections;

	@OneToMany(mappedBy = "addon", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<ItemAddonOption> options;

	public Item getItem() {
		return item;
	}

	public void setItem(Item item) {
		this.item = item;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public AddonType getType() {
		return type;
	}

	public void setType(AddonType type) {
		this.type = type;
	}

	public boolean isRequired() {
		return required;
	}

	public void setRequired(boolean required) {
		this.required = required;
	}

	public Integer getMaxSelections() {
		return maxSelections;
	}

	public void setMaxSelections(Integer maxSelections) {
		this.maxSelections = maxSelections;
	}

	public Set<ItemAddonOption> getOptions() {
		return options;
	}

	public void setOptions(Set<ItemAddonOption> options) {
		this.options = options;
	}
}