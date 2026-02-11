package com.example.kadan.service.activity;

import com.example.kadan.dto.enums.ActivityType;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.GroupMember;
import com.example.kadan.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class MemberActivityLog implements ActivityLog {

    private final User user;

    @Getter
    private final GroupMember groupMember;

    @Override
    public User getUser() {
        return this.user;
    }

    @Override
    public Group getGroup() {
        return this.groupMember.getGroup();
    }

    @Override
    public String getDescription(ActivityType activityType) {
        StringBuilder sb = new StringBuilder(this.user.getDisplayName());
        switch (activityType) {
            case MEMBER_ADDED -> sb.append(" added member: ");
            case MEMBER_REMOVED -> sb.append(" removed member: ");
            default -> sb.append(" performed an action on member: ");
        }
        sb.append(this.groupMember.getUser().getDisplayName());
        return sb.toString();
    }
}
