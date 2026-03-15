package com.icake.model;

public enum AddonType {
    SINGLE,  // Only one option can be selected (radio)
    MULTI,   // Multiple options can be selected (checkbox)
    SIZE     // Size selector — selected size determines price overrides for other addons
}