package com.civic.connect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "complaint_images")
public class ComplaintImage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "image_type", length = 50)
    private String imageType;

    public ComplaintImage() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ComplaintImage i = new ComplaintImage();
        public Builder complaint(Complaint val) { i.complaint = val; return this; }
        public Builder imageUrl(String val) { i.imageUrl = val; return this; }
        public Builder imageType(String val) { i.imageType = val; return this; }
        public ComplaintImage build() { return i; }
    }

    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }
}
