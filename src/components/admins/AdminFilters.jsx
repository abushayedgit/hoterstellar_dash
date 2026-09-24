import Input from '../ui/Input';
import { ADMIN_ROLES } from '../../schemas/admin';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
};

export default function AdminFilters({
  search,
  role,
  isActive,
  onSearchChange,
  onRoleChange,
  onIsActiveChange,
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Input
        id="admins-search"
        label="Search"
        placeholder="Name or email"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="admins-role" className="text-sm font-medium text-text-primary">
          Role
        </label>
        <select
          id="admins-role"
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
        >
          <option value="">All roles</option>
          {ADMIN_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="admins-active" className="text-sm font-medium text-text-primary">
          Status
        </label>
        <select
          id="admins-active"
          value={isActive}
          onChange={(e) => onIsActiveChange(e.target.value)}
          className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
    </div>
  );
}
