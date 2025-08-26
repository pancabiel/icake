package com.icake.model;

import jakarta.persistence.*;

@Entity
@Table(name = "addresses")
public class Address extends BaseEntity {

    @Column(name = "zip_code")
    private String zipCode;
    private String street;
    private String number;
    private String complement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public String getComplement() {
        return complement;
    }

    public void setComplement(String complement) {
        this.complement = complement;
    }

    public City getCity() {
        return city;
    }

    public void setCity(City city) {
        this.city = city;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(this.getStreet());
        sb.append(" - ");
        sb.append(this.getNumber());
        return sb.toString();
    }
}
