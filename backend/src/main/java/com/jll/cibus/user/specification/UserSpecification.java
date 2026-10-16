package com.jll.cibus.user.specification;

import com.jll.cibus.user.entity.UserEntity;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

    private UserSpecification() {}  // para evitar que se instancie

    public static Specification<UserEntity> nameContains(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + name.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("firstName")), pattern),
                    cb.like(cb.lower(root.get("lastName")), pattern)
            );
        };
    }

    public static Specification<UserEntity> dniEquals(Long dni) {
        return (root, query, cb) -> {
            if (dni == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("dni"), dni);
        };
    }

    public static Specification<UserEntity> emailEquals(String email) {
        return (root, query, cb) -> {
            if (email == null || email.isBlank()) {
                return cb.conjunction();
            }
            return cb.equal(cb.lower(root.get("email")), email.toLowerCase());
        };
    }

    public static Specification<UserEntity> phoneNumberEquals(String phoneNumber) {
        return (root, query, cb) -> {
            if (phoneNumber == null || phoneNumber.isBlank()) {
                return cb.conjunction();
            }
            return cb.equal(cb.lower(root.get("phoneNumber")), phoneNumber.toLowerCase());
        };
    }

    public static Specification<UserEntity> branchIdEquals(Long branchId) {
        return (root, query, cb) -> {
            if (branchId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("branch").get("id"), branchId);
        };
    }

    public static Specification<UserEntity> userRoleIdEquals(Long userRoleId) {
        return (root, query, cb) -> {
            if (userRoleId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("role").get("id"), userRoleId);
        };
    }

}
