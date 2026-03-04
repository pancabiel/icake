package com.icake.model;

import jakarta.persistence.*;

@Entity
@Table(name = "clients")
public class Client extends BaseEntity {

    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
