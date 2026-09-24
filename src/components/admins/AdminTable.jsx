import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faUserCheck, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { format, parseISO } from 'date-fns';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../shared/EmptyState';
import { cn } from '../../lib/cn';

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
};

const ROLE_TONE = {
  super_admin: 'accent',
  admin: 'primary',
  manager: 'neutral',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'yyyy-MM-dd HH:mm');
  } catch {
    return '—';
  }
};

/**
 * Which mutations the acting admin is allowed to perform on a target row.
 *
 * Rules (mirrored by the backend; frontend is UX only):
 *   1. Actor must be a Super Admin for any mutation other than "edit own name".
 *   2. No one can mutate another super_admin.
 *   3. No one can deactivate or delete themselves.
 *   4. A super_admin may edit only their own `name` (not their role, not isActive).
 */
const getRowCapabilities = ({ actorRole, actorId, target }) => {
  const isActorSuperAdmin = actorRole === 'super_admin';
  const isSelf = String(target?._id) === String(actorId);
  const isTargetSuperAdmin = target?.role === 'super_admin';

  // Editing: allowed for super_admin acting on non-super_admins, or on self (name only).
  // Admins/Managers cannot edit at all — the backend restricts mutation to admins.manage,
  // and only super_admin is documented to hold it.
  const canEdit = isActorSuperAdmin && (!isTargetSuperAdmin || isSelf);

  // Deactivate/Activate: super_admin only, never on another super_admin, never on self.
  const canToggleActive = isActorSuperAdmin && !isTargetSuperAdmin && !isSelf;

  // Delete: super_admin only, never on another super_admin, never on self.
  const canDelete = isActorSuperAdmin && !isTargetSuperAdmin && !isSelf;

  // Reason strings surfaced as button titles so the UI explains itself.
  const toggleReason = !isActorSuperAdmin
    ? 'Only Super Admins can change account status'
    : isSelf
      ? 'You cannot deactivate your own account'
      : isTargetSuperAdmin
        ? 'Super Admin accounts cannot be deactivated'
        : undefined;

  const deleteReason = !isActorSuperAdmin
    ? 'Only Super Admins can delete administrators'
    : isSelf
      ? 'You cannot delete your own account'
      : isTargetSuperAdmin
        ? 'Super Admin accounts cannot be deleted'
        : undefined;

  const editReason = !isActorSuperAdmin
    ? 'Only Super Admins can edit administrators'
    : isTargetSuperAdmin && !isSelf
      ? 'Super Admin accounts cannot be edited by other admins'
      : undefined;

  return { canEdit, canToggleActive, canDelete, toggleReason, deleteReason, editReason };
};

export default function AdminTable({
  items,
  loading,
  canManage,
  currentRole,
  currentAdminId,
  onEdit,
  onToggleActive,
  onDelete,
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-md bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <EmptyState title="No admins found" message="Try adjusting your filters." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-180 text-sm">
        <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Last login</th>
            {canManage && <th className="px-4 py-3 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((admin) => {
            const isSelf = String(admin._id) === String(currentAdminId);
            const caps = getRowCapabilities({
              actorRole: currentRole,
              actorId: currentAdminId,
              target: admin,
            });

            return (
              <tr
                key={admin._id}
                className={cn(
                  'border-b border-border transition',
                  onRowClick && 'cursor-pointer hover:bg-surface-muted',
                )}
                onClick={onRowClick ? () => onRowClick(admin) : undefined}
              >
                <td className="px-4 py-3 font-medium text-text-primary">
                  {admin.name ?? '—'}
                  {isSelf && (
                    <span className="ml-2 text-xs font-normal text-text-muted">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-secondary">{admin.email}</td>
                <td className="px-4 py-3">
                  <Badge tone={ROLE_TONE[admin.role] ?? 'neutral'}>
                    {ROLE_LABELS[admin.role] ?? admin.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={admin.isActive ? 'success' : 'danger'}>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-text-secondary">{formatDate(admin.lastLoginAt)}</td>
                {canManage && (
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!caps.canEdit}
                        title={caps.editReason}
                        aria-label={`Edit ${admin.name ?? admin.email}`}
                        onClick={() => caps.canEdit && onEdit(admin)}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!caps.canToggleActive}
                        title={caps.toggleReason}
                        aria-label={
                          admin.isActive
                            ? `Deactivate ${admin.name ?? admin.email}`
                            : `Activate ${admin.name ?? admin.email}`
                        }
                        onClick={() => caps.canToggleActive && onToggleActive(admin)}
                      >
                        <FontAwesomeIcon
                          icon={admin.isActive ? faUserSlash : faUserCheck}
                          className={
                            caps.canToggleActive
                              ? admin.isActive
                                ? 'text-warning'
                                : 'text-success'
                              : undefined
                          }
                        />
                      </Button>
                      {caps.canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${admin.name ?? admin.email}`}
                          onClick={() => onDelete(admin)}
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-danger" />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
