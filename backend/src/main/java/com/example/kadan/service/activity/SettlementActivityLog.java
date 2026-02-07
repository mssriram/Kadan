package com.example.kadan.service.activity;

import com.example.kadan.dto.enums.ActivityType;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.Settlement;
import com.example.kadan.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class SettlementActivityLog implements ActivityLog {

    private final User user;

    @Getter
    private final Settlement settlement;

    @Override
    public User getUser() {
        return this.user;
    }

    @Override
    public Group getGroup() {
        return this.settlement.getGroup();
    }

    @Override
    public String getDescription(ActivityType activityType) {
        StringBuilder sb = new StringBuilder("Settlement added: ");
        sb.append(this.user.getDisplayName());
        sb.append(" → ");
        sb.append(this.settlement.getCreditor().getDisplayName());
        sb.append(": ₹");
        sb.append(this.settlement.getAmount());
        return sb.toString();
    }
}
