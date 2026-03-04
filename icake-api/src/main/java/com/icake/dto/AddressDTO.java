package com.icake.dto;

import com.icake.model.Address;

public class AddressDTO {

    private Long id;
    private String resume;
    private String zipCode;
    private String street;
    private String number;
    private String complement;
    private CityDTO city;

    public AddressDTO() {
    }

    public AddressDTO(Address address) {
        this.id = address.getId();
        this.resume = address.getResume();
        this.zipCode = address.getZipCode();
        this.street = address.getStreet();
        this.number = address.getNumber();
        this.complement = address.getComplement();
        this.city = new CityDTO(address.getCity());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getResume() {
        return resume;
    }

    public void setResume(String resume) {
        this.resume = resume;
    }

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

    public CityDTO getCity() {
        return city;
    }

    public void setCity(CityDTO city) {
        this.city = city;
    }
}