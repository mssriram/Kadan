package com.example.kadan.expense;

import java.math.BigDecimal;
import java.util.UUID;

public record Debt(
        UUID debtor,
        UUID creditor,
        BigDecimal amount
) {
}
