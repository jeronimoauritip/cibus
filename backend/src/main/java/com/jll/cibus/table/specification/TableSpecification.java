package com.jll.cibus.table.specification;

import com.jll.cibus.table.entity.TableEntity;
import org.springframework.data.jpa.domain.Specification;

public class TableSpecification {

    private TableSpecification (){}

        public static Specification<TableEntity> equalsBranchId(Long branchId) {
            return (root, query, cb) -> branchId == null
                    ? cb.conjunction()
                    : cb.equal(root.get("branch").get("id"), branchId);
        }
        public static Specification<TableEntity> equalsTableNumber(Integer tableNumber) {
            return (root, query, cb) -> tableNumber == null || tableNumber <= 0
                    ? cb.conjunction()
                    : cb.equal(root.get("number"), tableNumber);
        }

        public static Specification<TableEntity> equalsCapacity(Integer capacity) {
            return (root, query, cb) -> capacity == null || capacity <= 0
                    ? cb.conjunction()
                    : cb.equal(root.get("capacity"), capacity);
        }

        public static Specification<TableEntity> isAvailable(Boolean available) {
            return (root, query, cb) -> available == null
                    ? cb.conjunction()
                    : cb.equal(root.get("available"), available);
        }

        public static Specification<TableEntity> equalsWaiterId(Long waiterId) {
            return (root, query, cb) -> waiterId == null || waiterId <= 0
                    ? cb.conjunction()
                    : cb.equal(root.get("waiter").get("id"), waiterId);
        }

}
