package com.example.kadan.repository;

import com.example.kadan.entity.Expense;
import com.example.kadan.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, UUID> {

    void deleteAllByExpense(Expense expense);

    @Query(value = """
        SELECT
          u.user_id AS userId,
          COALESCE(paid.total_paid, 0) AS totalPaid,
          COALESCE(owed.total_owed, 0) AS totalOwed,
          COALESCE(paid.total_paid, 0) - COALESCE(owed.total_owed, 0) AS netBalance
        FROM
          (
            SELECT DISTINCT es.user_id 
              FROM expense_splits es
              JOIN expenses e ON es.expense_id = e.id
             WHERE e.group_id = :groupId
          ) u
        LEFT JOIN (
            SELECT e.paid_by, SUM(es.amount) AS total_paid
              FROM expense_splits es
              JOIN expenses e ON es.expense_id = e.id
             WHERE e.group_id = :groupId
             GROUP BY e.paid_by
        ) paid ON paid.paid_by = u.user_id
        LEFT JOIN (
            SELECT es.user_id, SUM(es.amount) AS total_owed
              FROM expense_splits es
              JOIN expenses e ON es.expense_id = e.id
             WHERE e.group_id = :groupId
             GROUP BY es.user_id
        ) owed ON owed.user_id = u.user_id
        ORDER BY netBalance DESC
        """, nativeQuery = true)
    List<GroupBalance> findGroupBalances(@Param("groupId") UUID groupId);

    interface GroupBalance {
        UUID getUserId();
        BigDecimal getTotalPaid();
        BigDecimal getTotalOwed();
        BigDecimal getNetBalance();
    }
}
