import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Dialog from '../../components/ui/Dialog';
import ErrorState from '../../components/shared/ErrorState';
import CategoryFilters from '../../components/categories/CategoryFilters';
import CategoryTable from '../../components/categories/CategoryTable';
import CategoryForm from '../../components/categories/CategoryForm';
import { useCategories, useDeleteCategory } from '../../hooks/useCategories';
import { usePermission } from '../../hooks/usePermission';

const DEFAULT_LIMIT = 50;

export default function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = usePermission();
  const canCreate = can('categories.create');
  const canUpdate = can('categories.update');
  const canDelete = can('categories.delete');
  const canManage = canCreate || canUpdate || canDelete;

  const page = Number(searchParams.get('page') ?? 1);
  const isActive = searchParams.get('isActive') ?? '';
  const sortBy = searchParams.get('sortBy') ?? 'displayOrder';
  const sortOrder = searchParams.get('sortOrder') ?? 'asc';

  const params = useMemo(
    () => ({
      page,
      limit: DEFAULT_LIMIT,
      ...(isActive ? { isActive } : {}),
      sortBy,
      sortOrder,
    }),
    [page, isActive, sortBy, sortOrder],
  );

  const query = useCategories(params);
  const deleteMutation = useDeleteCategory();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
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

  const pagination = query.data?.pagination;

  const onConfirmDelete = useCallback(async () => {
    if (!confirmDelete) return;
    try {
      await deleteMutation.mutateAsync(confirmDelete._id);
    } finally {
      setConfirmDelete(null);
    }
  }, [confirmDelete, deleteMutation]);

  return (
    <PageContainer>
      <PageHeader
        title="Categories"
        description="Organize the menu with categories."
        actions={
          canCreate ? (
            <Button onClick={() => setCreateOpen(true)}>
              <FontAwesomeIcon icon={faPlus} />
              Create category
            </Button>
          ) : null
        }
      />

      <Card className="mb-4">
        <CategoryFilters
          isActive={isActive}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onIsActiveChange={(v) => updateParam('isActive', v)}
          onSortByChange={(v) => updateParam('sortBy', v)}
          onSortOrderChange={(v) => updateParam('sortOrder', v)}
        />
      </Card>

      <Card className="p-0">
        {query.isError ? (
          <div className="p-4">
            <ErrorState
              title="Couldn’t load categories"
              message={query.error?.message}
              onRetry={() => query.refetch()}
            />
          </div>
        ) : (
          <CategoryTable
            items={query.data?.items ?? []}
            loading={query.isLoading}
            canManage={canManage}
            onCreate={() => setCreateOpen(true)}
            onEdit={(c) => setEditing(c)}
            onDelete={(c) => setConfirmDelete(c)}
          />
        )}

        {pagination && pagination.total > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <p className="text-text-muted">
              {pagination.total} categor{pagination.total === 1 ? 'y' : 'ies'} · page{' '}
              {pagination.page} of {pagination.totalPages}
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

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} title="Create category">
        <CategoryForm
          mode="create"
          onSuccess={() => setCreateOpen(false)}
          onCancel={() => setCreateOpen(false)}
        />
      </Dialog>

      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.name}` : 'Edit category'}
      >
        {editing && (
          <CategoryForm
            mode="edit"
            category={editing}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        )}
      </Dialog>

      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete category"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteMutation.isPending} onClick={onConfirmDelete}>
              Delete permanently
            </Button>
          </div>
        }
      >
        {confirmDelete && (
          <div className="flex flex-col gap-2 text-sm text-text-secondary">
            <p>
              This will permanently delete{' '}
              <span className="font-medium text-text-primary">{confirmDelete.name}</span>.
            </p>
            <p className="text-danger">
              Deletion is blocked by the backend if any foods are still attached to this category.
            </p>
          </div>
        )}
      </Dialog>
    </PageContainer>
  );
}
