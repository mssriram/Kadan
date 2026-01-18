package com.example.kadan.entity;

import com.example.kadan.dto.enums.GroupStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Table(name = "groups")
@Entity
@Getter
@Setter
@NoArgsConstructor
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    @Column(nullable = false)
    private String name;
    private String description;
    private String currency = "INR";

    @Column(name = "simplify_debts")
    private boolean simplifyDebts;

    @Enumerated(EnumType.STRING)
    private GroupStatus status = GroupStatus.ACTIVE;

    @JoinColumn(name = "created_by", updatable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private User createdBy;

    @JsonIgnore
    @ManyToMany(mappedBy = "groups", fetch = FetchType.LAZY)
    private List<User> members;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
