package com.civic.connect.model;

public enum ComplaintPriority {
    HIGH,
    MEDIUM,
    LOW;

    public static ComplaintPriority fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return MEDIUM;
        }
        String cleanVal = value.trim().toUpperCase();
        for (ComplaintPriority p : values()) {
            if (p.name().equals(cleanVal)) {
                return p;
            }
        }
        return MEDIUM;
    }
}
