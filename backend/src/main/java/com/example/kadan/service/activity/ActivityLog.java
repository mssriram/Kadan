package com.example.kadan.service.activity;

import com.example.kadan.dto.enums.ActivityType;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.User;

public interface ActivityLog {

    User getUser();
    Group getGroup();
    String getDescription(ActivityType activityType);
}
