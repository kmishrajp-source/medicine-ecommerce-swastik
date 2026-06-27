/**
 * Role-Based Access Control (RBAC) System
 * Defines roles, permissions, and validation utilities.
 */

export const ROLES = {
    SUPER_ADMIN: "SUPER_ADMIN",
    OPERATIONS_MANAGER: "OPERATIONS_MANAGER",
    SALES_STAFF: "SALES_STAFF",
    PHARMACIST: "PHARMACIST",
    WAREHOUSE_STAFF: "WAREHOUSE_STAFF",
    CUSTOMER_SUPPORT: "CUSTOMER_SUPPORT",
    CUSTOMER: "CUSTOMER", // Default
};

export const ACTIONS = {
    // Super Admin Level
    MANAGE_SETTINGS: "MANAGE_SETTINGS",
    MANAGE_USERS: "MANAGE_USERS",
    MANAGE_PRICES_GLOBALLY: "MANAGE_PRICES_GLOBALLY",
    MANAGE_SOPS: "MANAGE_SOPS",
    HARD_DELETE_RECORDS: "HARD_DELETE_RECORDS",
    VIEW_ALL_REPORTS: "VIEW_ALL_REPORTS",
    EXPORT_DATABASE: "EXPORT_DATABASE",
    APPROVE_LARGE_REFUNDS: "APPROVE_LARGE_REFUNDS",
    MANAGE_PERMISSIONS: "MANAGE_PERMISSIONS",

    // Operations Manager
    PROCESS_ORDERS: "PROCESS_ORDERS",
    UPDATE_ORDER_STATUS: "UPDATE_ORDER_STATUS",
    ASSIGN_DELIVERIES: "ASSIGN_DELIVERIES",
    VIEW_INVENTORY: "VIEW_INVENTORY",
    GENERATE_REPORTS: "GENERATE_REPORTS",

    // Sales Staff
    CREATE_ORDERS: "CREATE_ORDERS",
    VIEW_CUSTOMER_DETAILS: "VIEW_CUSTOMER_DETAILS",
    PRINT_INVOICES: "PRINT_INVOICES",
    CHECK_STOCK: "CHECK_STOCK",

    // Pharmacist
    VERIFY_PRESCRIPTIONS: "VERIFY_PRESCRIPTIONS",
    APPROVE_DISPENSING: "APPROVE_DISPENSING",
    UPDATE_MEDICINE_AVAILABILITY: "UPDATE_MEDICINE_AVAILABILITY",

    // Warehouse
    RECEIVE_STOCK: "RECEIVE_STOCK",
    DISPATCH_STOCK: "DISPATCH_STOCK",
    UPDATE_INVENTORY_QUANTITIES: "UPDATE_INVENTORY_QUANTITIES",

    // Customer Support
    VIEW_CUSTOMER_ORDERS: "VIEW_CUSTOMER_ORDERS",
    UPDATE_SUPPORT_TICKETS: "UPDATE_SUPPORT_TICKETS",
    PROCESS_APPROVED_RETURNS: "PROCESS_APPROVED_RETURNS",
};

/**
 * The Permissions Matrix
 * Defines exactly what actions each role is allowed to perform.
 */
export const PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: Object.values(ACTIONS), // All access

    [ROLES.OPERATIONS_MANAGER]: [
        ACTIONS.PROCESS_ORDERS,
        ACTIONS.UPDATE_ORDER_STATUS,
        ACTIONS.ASSIGN_DELIVERIES,
        ACTIONS.VIEW_INVENTORY,
        ACTIONS.GENERATE_REPORTS,
        ACTIONS.VIEW_CUSTOMER_DETAILS, // Inherited practical need
    ],

    [ROLES.SALES_STAFF]: [
        ACTIONS.CREATE_ORDERS,
        ACTIONS.VIEW_CUSTOMER_DETAILS,
        ACTIONS.PRINT_INVOICES,
        ACTIONS.CHECK_STOCK,
    ],

    [ROLES.PHARMACIST]: [
        ACTIONS.VERIFY_PRESCRIPTIONS,
        ACTIONS.APPROVE_DISPENSING,
        ACTIONS.UPDATE_MEDICINE_AVAILABILITY,
        ACTIONS.VIEW_INVENTORY,
    ],

    [ROLES.WAREHOUSE_STAFF]: [
        ACTIONS.RECEIVE_STOCK,
        ACTIONS.DISPATCH_STOCK,
        ACTIONS.UPDATE_INVENTORY_QUANTITIES,
        ACTIONS.CHECK_STOCK,
        ACTIONS.VIEW_INVENTORY,
    ],

    [ROLES.CUSTOMER_SUPPORT]: [
        ACTIONS.VIEW_CUSTOMER_ORDERS,
        ACTIONS.UPDATE_SUPPORT_TICKETS,
        ACTIONS.PROCESS_APPROVED_RETURNS,
    ],

    [ROLES.CUSTOMER]: [
        // Customers don't have back-office admin permissions
    ],
};

/**
 * Check if a user role has permission to perform a specific action.
 * @param {string} role - The role of the user (e.g. from session.user.role)
 * @param {string} action - The action from ACTIONS
 * @returns {boolean}
 */
export function hasPermission(role, action) {
    if (!role) return false;
    
    // Legacy support for "ADMIN" role acting as SUPER_ADMIN temporarily
    if (role === "ADMIN" || role === ROLES.SUPER_ADMIN) {
        return true; 
    }

    const rolePermissions = PERMISSIONS[role];
    if (!rolePermissions) return false;

    return rolePermissions.includes(action);
}

/**
 * Get all available roles for UI dropdowns
 */
export function getAvailableRoles() {
    return Object.values(ROLES);
}
