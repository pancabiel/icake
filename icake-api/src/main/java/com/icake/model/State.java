package com.icake.model;

import jakarta.persistence.*;

@Entity
@Table(name = "states")
public class State extends BaseEntity{

    private String name;

    @Column(name = "state_code", length = 2)
    private String stateCode;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStateCode() {
        return stateCode;
    }

    public void setStateCode(String stateCode) {
        this.stateCode = stateCode;
    }
}
