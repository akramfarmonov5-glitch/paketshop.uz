// Backward-compatible endpoint. Authorization and validation are handled by
// the Auth.js/RBAC-protected admin order handler.
export { PATCH as POST } from '@/app/api/admin/orders/route';
