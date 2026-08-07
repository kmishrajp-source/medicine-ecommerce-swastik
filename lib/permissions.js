/**
 * RBAC Permissions — Swastik Medicare
 *
 * Central source of truth for role-based access control.
 * Used by:
 *   - Admin sidebar (show/hide menu items)
 *   - Page-level guards (redirect if not allowed)
 *   - API routes (return 403 if not allowed)
 */

// ── All Staff Roles ────────────────────────────────────────────────────────────
export const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'ACCOUNTS', 'DELIVERY_MANAGER', 'CRM_STAFF', 'OPERATIONS'];
export const ALL_ROLES = [...STAFF_ROLES, 'CUSTOMER', 'RETAILER', 'DOCTOR'];

export const ROLE_LABELS = {
    SUPER_ADMIN:      'Super Admin (Owner)',
    ADMIN:            'Admin (Manager)',
    PHARMACIST:       'Pharmacist',
    ACCOUNTS:         'Accounts',
    DELIVERY_MANAGER: 'Delivery Manager',
    CRM_STAFF:        'CRM / Support',
    OPERATIONS:       'Operations',
    CUSTOMER:         'Customer',
    RETAILER:         'Retailer',
};

export const ROLE_COLORS = {
    SUPER_ADMIN:      '#7C3AED',
    ADMIN:            '#2563EB',
    PHARMACIST:       '#16A34A',
    ACCOUNTS:         '#D97706',
    DELIVERY_MANAGER: '#0891B2',
    CRM_STAFF:        '#DB2777',
    OPERATIONS:       '#6B7280',
    CUSTOMER:         '#94A3B8',
};

// ── Who can manage staff accounts ─────────────────────────────────────────────
export const CAN_MANAGE_STAFF = ['SUPER_ADMIN', 'ADMIN'];

// ── Admin Pages → Which roles can access ──────────────────────────────────────
// Key = the path segment after /admin/
// Value = array of roles allowed (empty array = nobody)
export const PAGE_PERMISSIONS = {
    // Dashboard
    '':                     ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'ACCOUNTS', 'DELIVERY_MANAGER', 'CRM_STAFF', 'OPERATIONS'],

    // Inventory & Stock
    'inventory':            ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'OPERATIONS'],
    'bulk-upload':          ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST'],
    'shortage-predictor':   ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'OPERATIONS'],
    'sop/inventory-management': ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST'],
    'sop/stock-adjustment': ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST'],
    'sop/procurement':      ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'ACCOUNTS'],
    'sop/warehouse':        ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'OPERATIONS'],

    // Prescriptions
    'prescriptions':        ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'CRM_STAFF'],
    'approvals':            ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'CRM_STAFF'],
    'action-approvals':     ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'CRM_STAFF'],
    'returns':              ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'CRM_STAFF'],

    // Orders & Customer
    'requests':             ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'CRM_STAFF', 'OPERATIONS'],
    'tracking':             ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_MANAGER', 'OPERATIONS'],
    'delivery-monitor':     ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_MANAGER', 'OPERATIONS'],
    'appointments':         ['SUPER_ADMIN', 'ADMIN', 'CRM_STAFF', 'OPERATIONS'],
    'subscriptions':        ['SUPER_ADMIN', 'ADMIN', 'CRM_STAFF', 'ACCOUNTS'],

    // Finance
    'finance':              ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'],
    'analytics':            ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'],
    'cash-management':      ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'],
    'withdrawals':          ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'],
    'partners':             ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'],
    'coupons':              ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS', 'CRM_STAFF'],
    'competitor-bills':     ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'],

    // CRM / Marketing
    'crm':                  ['SUPER_ADMIN', 'ADMIN', 'CRM_STAFF'],
    'crm/import':           ['SUPER_ADMIN', 'ADMIN', 'CRM_STAFF'],
    'leads':                ['SUPER_ADMIN', 'ADMIN', 'CRM_STAFF'],
    'b2b-leads':            ['SUPER_ADMIN', 'ADMIN', 'CRM_STAFF'],
    'sms':                  ['SUPER_ADMIN', 'ADMIN', 'CRM_STAFF'],
    'mass-whatsapp':        ['SUPER_ADMIN', 'ADMIN', 'CRM_STAFF'],
    'market-intelligence':  ['SUPER_ADMIN', 'ADMIN', 'CRM_STAFF'],
    'sos':                  ['SUPER_ADMIN', 'ADMIN', 'CRM_STAFF'],
    'staff-approvals':      ['SUPER_ADMIN', 'ADMIN', 'CRM_STAFF'],

    // Delivery
    'directory':            ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_MANAGER', 'CRM_STAFF'],

    // Admin-only
    'staff-management':     ['SUPER_ADMIN', 'ADMIN'],
    'settings':             ['SUPER_ADMIN'],
    'audit-logs':           ['SUPER_ADMIN', 'ADMIN'],
    'system-health':        ['SUPER_ADMIN', 'ADMIN'],
    'monitor':              ['SUPER_ADMIN', 'ADMIN'],
    'insurance':            ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'],
    'retailers':            ['SUPER_ADMIN', 'ADMIN'],

    // SOPs
    'sop':                  ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS'],
    'sop/bcp':              ['SUPER_ADMIN', 'ADMIN'],
    'sop/delivery':         ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_MANAGER'],
    'sop/finance':          ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'],
    'sop/it':               ['SUPER_ADMIN'],
    'sop/packaging':        ['SUPER_ADMIN', 'ADMIN', 'OPERATIONS'],
    'sop/quality':          ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'OPERATIONS'],
    'sop/reports':          ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS'],
    'sop/returns-refunds':  ['SUPER_ADMIN', 'ADMIN', 'CRM_STAFF'],
    'sop/risk':             ['SUPER_ADMIN', 'ADMIN'],
    'sop/version-control':  ['SUPER_ADMIN'],
    'sop/purchase-requisition': ['SUPER_ADMIN', 'ADMIN', 'PHARMACIST', 'ACCOUNTS'],
};

// ── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Check if a role can access an admin page.
 * @param {string} role - The user's role
 * @param {string} page - The page path segment (e.g. 'inventory', 'finance')
 * @returns {boolean}
 */
export function canAccess(role, page) {
    if (role === 'SUPER_ADMIN') return true; // super admin bypasses all
    const allowed = PAGE_PERMISSIONS[page];
    if (!allowed) return false;
    return allowed.includes(role);
}

/**
 * Check if a role is any kind of staff (not a customer).
 */
export function isStaff(role) {
    return STAFF_ROLES.includes(role);
}

/**
 * Get all pages a role can access.
 */
export function getPagesForRole(role) {
    if (role === 'SUPER_ADMIN') return Object.keys(PAGE_PERMISSIONS);
    return Object.entries(PAGE_PERMISSIONS)
        .filter(([, allowed]) => allowed.includes(role))
        .map(([page]) => page);
}

// ── Admin Sidebar Menu Definition ─────────────────────────────────────────────
// Used by admin layout to show only relevant menu items per role
export const ADMIN_MENU = [
    { label: '📊 Dashboard',        page: '',                href: '/admin' },
    { label: '───── INVENTORY ─────', section: true },
    { label: '📦 Inventory',         page: 'inventory',      href: '/admin/inventory' },
    { label: '📤 Bulk Upload',        page: 'bulk-upload',    href: '/admin/bulk-upload' },
    { label: '📉 Shortage Predictor', page: 'shortage-predictor', href: '/admin/shortage-predictor' },
    { label: '───── ORDERS ─────',   section: true },
    { label: '📋 Requests',           page: 'requests',       href: '/admin/requests' },
    { label: '💊 Prescriptions',      page: 'prescriptions',  href: '/admin/prescriptions' },
    { label: '✅ Approvals',          page: 'approvals',      href: '/admin/approvals' },
    { label: '↩️ Returns',            page: 'returns',        href: '/admin/returns' },
    { label: '───── DELIVERY ─────', section: true },
    { label: '🚚 Delivery Monitor',   page: 'delivery-monitor', href: '/admin/delivery-monitor' },
    { label: '📍 Tracking',           page: 'tracking',       href: '/admin/tracking' },
    { label: '───── FINANCE ─────',  section: true },
    { label: '💰 Finance',            page: 'finance',        href: '/admin/finance' },
    { label: '📈 Analytics',          page: 'analytics',      href: '/admin/analytics' },
    { label: '💵 Cash Management',    page: 'cash-management', href: '/admin/cash-management' },
    { label: '🎫 Coupons',            page: 'coupons',        href: '/admin/coupons' },
    { label: '───── CRM ─────',      section: true },
    { label: '👥 CRM',                page: 'crm',            href: '/admin/crm' },
    { label: '📧 Leads',              page: 'leads',          href: '/admin/leads' },
    { label: '📱 SMS',                page: 'sms',            href: '/admin/sms' },
    { label: '───── ADMIN ─────',    section: true },
    { label: '👨‍💼 Staff Management',    page: 'staff-management', href: '/admin/staff-management' },
    { label: '🔍 Audit Logs',         page: 'audit-logs',     href: '/admin/audit-logs' },
    { label: '⚙️ Settings',           page: 'settings',       href: '/admin/settings' },
];
