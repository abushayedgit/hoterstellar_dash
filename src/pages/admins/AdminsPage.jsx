import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Dialog from '../../components/ui/Dialog';
import ErrorState from '../../components/shared/ErrorState';
import AdminFilters from '../../components/admins/AdminFilters';
import AdminTable from '../../components/admins/AdminTable';
import CreateAdminForm from '../../components/admins/CreateAdminForm';
import EditAdminForm from '../../components/admins/EditAdminForm';
import { useAdmins, useDeleteAdmin, useToggleAdminActive } from '../../hooks/useAdmins';
import { usePermission } from '../../hooks/usePermission';
import { useAuthStore } from '../../store/authStore';
import { toast } from '../../components/ui/Toast';

const DEFAULT_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 350;

/**
 * Central mutation-permission predicate. Every mutating action in this page
 * consults it. Returns null when the action is allowed, or a human-readable
 * reason string when it must be blocked.
 *
 * Rules (backend enforces authoritatively; this is UX):
 *   - delete       : not self, not another super_admin
 *   - toggleActive : not self, not another super_admin
 *   - edit         : not another super_admin (self-edit of name is fine, form
 *                    additionally disables role/isActive when editing self)
 */
const getMutationBlock = ({ target, currentAdminId, kind }) => {
  if (!target) return 'Invalid target.';
  const isSelf = String(target._id) === String(currentAdminId);
  const isTargetSuperAdmin = target.role === 'super_admin';

  if (kind === 'delete') {
    if (isSelf) return 'You cannot delete your own account.';
    if (isTargetSuperAdmin) return 'Super Admin accounts cannot be deleted.';
    return null;
  }

  if (kind === 'toggleActive') {
    if (isSelf) return 'You cannot deactivate your own account.';
    if (isTargetSuperAdmin) return 'Super Admin accounts cannot be deactivated.';
    return null;
  }

  if (kind === 'edit') {
    if (isTargetSuperAdmin && !isSelf) {
      return 'Super Admin accounts cannot be edited by other admins.';
    }
    return null;
  }

  return null;
};

export default function AdminsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = usePermission();
  const currentAdminId = useAuthStore((s) => s.admin?._id);
  const currentRole = useAuthStore((s) => s.admin?.role);
  const canManage = can('admins.manage');

  // ── Filter state (URL-owned) ────────────────────────────────────
  const page = Number(searchParams.get('page') ?? 1);
  const roleFilter = searchParams.get('role') ?? '';
  const isActive = searchParams.get('isActive') ?? '';
  const searchParam = searchParams.get('search') ?? '';

  // ── Debounced search input ──────────────────────────────────────
  // Local state holds the in-progress value. A ref tracks the last value we
  // pushed to the URL so that an external URL change (back/forward, deep
  // link) syncs back into the input — but our own writes do not.
  const [searchInput, setSearchInput] = useState(searchParam);
  const lastPushedSearchRef = useRef(searchParam);

  useEffect(() => {
    if (searchParam === lastPushedSearchRef.current) return;
    lastPushedSearchRef.current = searchParam;
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    if (searchInput === searchParam) return;
    const id = setTimeout(() => {
      lastPushedSearchRef.current = searchInput;
      const next = new URLSearchParams(searchParams);
      if (searchInput) next.set('search', searchInput);
      else next.delete('search');
      next.set('page', '1');
      setSearchParams(next, { replace: true });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const params = useMemo(
    () => ({
      page,
      limit: DEFAULT_LIMIT,
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(isActive ? { isActive } : {}),
      ...(searchParam ? { search: searchParam } : {}),
    }),
    [page, roleFilter, isActive, searchParam],
  );

  const adminsQuery = useAdmins(params);
  const toggleActive = useToggleAdminActive();
  const deleteAdmin = useDeleteAdmin();

  // ── Dialog state ────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const updateParam = useCallback(
    (key, value) => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== 'page') next.set('page', '1');
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const pagination = adminsQuery.data?.pagination;

  // ── Guarded actions ─────────────────────────────────────────────
  const openEdit = useCallback(
    (admin) => {
      const block = getMutationBlock({ target: admin, currentAdminId, kind: 'edit' });
      if (block) {
        toast.error(block);
        return;
      }
      setEditing(admin);
    },
    [currentAdminId],
  );

  const confirmToggleActive = useCallback(async () => {
    if (!confirmToggle) return;
    const block = getMutationBlock({
      target: confirmToggle,
      currentAdminId,
      kind: 'toggleActive',
    });
    if (block) {
      toast.error(block);
      setConfirmToggle(null);
      return;
    }
    try {
      await toggleActive.mutateAsync({
        id: confirmToggle._id,
        active: !confirmToggle.isActive,
      });
    } finally {
      setConfirmToggle(null);
    }
  }, [confirmToggle, currentAdminId, toggleActive]);

  const confirmDeleteAdmin = useCallback(async () => {
    if (!confirmDelete) return;
    const block = getMutationBlock({
      target: confirmDelete,
      currentAdminId,
      kind: 'delete',
    });
    if (block) {
      toast.error(block);
      setConfirmDelete(null);
      return;
    }
    try {
      await deleteAdmin.mutateAsync(confirmDelete._id);
    } finally {
      setConfirmDelete(null);
    }
  }, [confirmDelete, currentAdminId, deleteAdmin]);

  return (
    <PageContainer>
      <PageHeader
        title="Admins"
        description="Manage administrator accounts and access."
        actions={
          canManage ? (
            <Button onClick={() => setCreateOpen(true)}>
              <FontAwesomeIcon icon={faPlus} />
              Create admin
            </Button>
          ) : null
        }
      />

      <Card className="mb-4">
        <AdminFilters
          search={searchInput}
          role={roleFilter}
          isActive={isActive}
          onSearchChange={setSearchInput}
          onRoleChange={(v) => updateParam('role', v)}
          onIsActiveChange={(v) => updateParam('isActive', v)}
        />
      </Card>

      <Card className="p-0">
        {adminsQuery.isError ? (
          <div className="p-4">
            <ErrorState
              title="Couldn’t load admins"
              message={adminsQuery.error?.message}
              onRetry={() => adminsQuery.refetch()}
            />
          </div>
        ) : (
          <AdminTable
            items={adminsQuery.data?.items ?? []}
            loading={adminsQuery.isLoading}
            canManage={canManage}
            currentRole={currentRole}
            currentAdminId={currentAdminId}
            onEdit={openEdit}
            onToggleActive={(admin) => setConfirmToggle(admin)}
            onDelete={(admin) => setConfirmDelete(admin)}
          />
        )}

        {pagination && pagination.total > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <p className="text-text-muted">
              {pagination.total} admin{pagination.total === 1 ? '' : 's'} · page {pagination.page}{' '}
              of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrev}
                onClick={() => updateParam('page', String(pagination.page - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => updateParam('page', String(pagination.page + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create admin">
        <CreateAdminForm
          onSuccess={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      </Dialog>

      {/* Edit */}
      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.name ?? editing.email}` : 'Edit admin'}
      >
        {editing && (
          <EditAdminForm
            admin={editing}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Dialog>

      {/* Toggle active */}
      <Dialog
        open={Boolean(confirmToggle)}
        onClose={() => setConfirmToggle(null)}
        title={confirmToggle?.isActive ? 'Deactivate admin' : 'Activate admin'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmToggle(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmToggle?.isActive ? 'danger' : 'primary'}
              loading={toggleActive.isPending}
              onClick={confirmToggleActive}
            >
              {confirmToggle?.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        }
      >
        {confirmToggle && (
          <p className="text-sm text-text-secondary">
            {confirmToggle.isActive
              ? `Deactivating ${confirmToggle.name ?? confirmToggle.email} will prevent them from signing in.`
              : `Reactivate ${confirmToggle.name ?? confirmToggle.email} and allow them to sign in again.`}
          </p>
        )}
      </Dialog>

      {/* Delete */}
      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete admin"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteAdmin.isPending} onClick={confirmDeleteAdmin}>
              Delete permanently
            </Button>
          </div>
        }
      >
        {confirmDelete && (
          <div className="flex flex-col gap-2 text-sm text-text-secondary">
            <p>
              This will permanently delete{' '}
              <span className="font-medium text-text-primary">
                {confirmDelete.name ?? confirmDelete.email}
              </span>
              .
            </p>
            <p className="text-danger">
              This action is destructive and rate-limited. It cannot be undone.
            </p>
          </div>
        )}
      </Dialog>
    </PageContainer>
  );
}
