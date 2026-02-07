package com.example.kadan.service.activity;

import com.example.kadan.dto.enums.ActivityType;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.User;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class UserActivityLog implements ActivityLog {

    private final User user;

    @Override
    public User getUser() {
        return this.user;
    }

    @Override
    public Group getGroup() {
        return null;
    }

    @Override
    public String getDescription(ActivityType activityType) {
        StringBuilder sb = new StringBuilder(this.user.getDisplayName());
        switch (activityType) {
            case USER_REGISTERED -> sb.append(" registered an account.");
            case USER_LOGIN -> sb.append(" logged in.");
            default -> sb.append(" performed an action.");
        }
        return sb.toString();
    }
}
