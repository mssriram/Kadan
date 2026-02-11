package com.example.kadan.service.activity;

import com.example.kadan.dto.enums.ActivityType;
import com.example.kadan.entity.Expense;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class ExpenseActivityLog implements ActivityLog {

    private final User user;

    @Getter
    private final Expense expense;

    @Override
    public User getUser() {
        return this.user;
    }

    @Override
    public Group getGroup() {
        return this.expense.getGroup();
    }

    @Override
    public String getDescription(ActivityType activityType) {
        StringBuilder sb = new StringBuilder(this.user.getDisplayName());
        switch (activityType) {
            case EXPENSE_CREATED -> sb.append(" created expense: ");
            case EXPENSE_UPDATED -> sb.append(" updated expense: ");
            case EXPENSE_DELETED -> sb.append(" deleted expense: ");
            default -> sb.append(" performed an action on expense ");
        }
        sb.append(this.expense.getDescription());
        sb.append(" (").append(this.expense.getAmount()).append(")");
        return sb.toString();
    }

}
