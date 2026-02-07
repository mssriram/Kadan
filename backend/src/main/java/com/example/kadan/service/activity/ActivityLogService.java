package com.example.kadan.service.activity;

import com.example.kadan.dto.enums.ActivityType;
import com.example.kadan.entity.Activity;
import com.example.kadan.entity.Expense;
import com.example.kadan.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionalEventListener;

import static org.springframework.transaction.event.TransactionPhase.AFTER_COMMIT;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityRepository activityRepository;

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = AFTER_COMMIT)
    void logActivityToDb(ActivityEvent event) {
        Activity activity = new Activity();
        activity.setActivityType(event.getActivityType());
        activity.setUser(event.getActivityLog().getUser());
        activity.setGroup(event.getActivityLog().getGroup());
        activity.setDescription(event.getDescription());
        log.info(activity.getDescription());
    }

    @Async
    @EventListener
    void logActivity(ActivityEvent event) {
        log.info(event.getDescription());
    }

    public void logActivity(ActivityType expenseCreated, ActivityLog expenseActivityLog, Object before, Object after) {

    }
}
