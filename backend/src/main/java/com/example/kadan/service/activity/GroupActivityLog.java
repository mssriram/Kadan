package com.example.kadan.service.activity;

import com.example.kadan.dto.enums.ActivityType;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.User;
import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor
public class GroupActivityLog implements ActivityLog {

    private final User user;
    private final Group group;

    @Override
    public User getUser() {
        return this.user;
    }

    @Override
    public Group getGroup() {
        return this.group;
    }

    @Override
    public String getDescription(ActivityType activityType) {
        StringBuilder sb = new StringBuilder(this.user.getDisplayName());
        switch (activityType) {
            case GROUP_CREATED -> sb.append(" created group: ");
            case GROUP_UPDATED -> sb.append(" updated group: ");
            case GROUP_DELETED -> sb.append(" deleted group: ");
            default -> sb.append(" performed an action on group: ");
        }
        sb.append(this.group.getName());
        return sb.toString();
    }
}
