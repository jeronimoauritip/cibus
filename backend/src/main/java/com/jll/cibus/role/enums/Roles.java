package com.jll.cibus.role.enums;

import lombok.Getter;

import java.util.List;

@Getter
public enum Roles {

    ADMIN(
            Permits.values()
    ),
    MANAGER(
            Permits.USER_READ,
            Permits.USER_UPDATE,
            Permits.PRODUCT_READ,
            Permits.BRANCH_PRODUCT_READ,
            Permits.BRANCH_PRODUCT_CREATE,
            Permits.BRANCH_PRODUCT_UPDATE,
            Permits.BRANCH_PRODUCT_DELETE,
            Permits.CATEGORY_READ,
            Permits.TABLE_CREATE,
            Permits.TABLE_UPDATE,
            Permits.TABLE_DELETE,
            Permits.TABLE_OPEN,
            Permits.TABLE_CLOSE,
            Permits.TABLE_READ,
            Permits.ORDER_READ,
            Permits.ORDER_CREATE,
            Permits.ORDER_UPDATE,
            Permits.ORDER_CANCEL,
            Permits.ORDER_CLOSE,
            Permits.ORDER_STATUS_READ,
            Permits.ORDER_CHANGE_STATUS,
            Permits.ORDER_STATUS_UPDATE,
            Permits.PAYMENT_READ
    ),
    HOST(
            Permits.TABLE_READ,
            Permits.TABLE_UPDATE,
            Permits.TABLE_OPEN,
            Permits.TABLE_CLOSE,
            Permits.BRANCH_PRODUCT_READ,
            Permits.ORDER_READ,
            Permits.ORDER_CREATE,
            Permits.ORDER_UPDATE,
            Permits.ORDER_CANCEL,
            Permits.ORDER_CLOSE,
            Permits.ORDER_STATUS_READ,
            Permits.PAYMENT_READ
    ),
    WAITER(
            Permits.TABLE_READ,
            Permits.BRANCH_PRODUCT_READ,
            Permits.ORDER_READ,
            Permits.ORDER_CREATE,
            Permits.ORDER_UPDATE,
            Permits.ORDER_CANCEL,
            Permits.ORDER_CLOSE,
            Permits.ORDER_STATUS_READ,
            Permits.ORDER_CHANGE_STATUS,
            Permits.ORDER_STATUS_UPDATE,
            Permits.PAYMENT_READ
    ),
    KITCHEN(
            Permits.BRANCH_PRODUCT_READ,
            Permits.ORDER_READ,
            Permits.ORDER_CHANGE_STATUS,
            Permits.ORDER_STATUS_READ,
            Permits.ORDER_STATUS_UPDATE
    );

    private final List<Permits> permits;

    Roles(Permits... permits) {
        this.permits = List.of(permits);
    }

    public List<Permits> getPermits() {
        return permits;
    }
}
