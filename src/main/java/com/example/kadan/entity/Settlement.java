package com.example.kadan.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Table(name = "settlements")
@Entity
@Getter
@Builder
@AllArgsConstructor
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    UUID id;

    BigDecimal amount;
    String currency;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "debtor_id")
    User debtor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "creditor_id")
    User creditor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    Group group;

    @Column(name = "created_at")
    @CreationTimestamp
    OffsetDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    OffsetDateTime updatedAt;
}
