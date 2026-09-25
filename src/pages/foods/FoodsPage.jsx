import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Dialog from '../../components/ui/Dialog';
import ErrorState from '../../components/shared/ErrorState';
import FoodFilters from '../../components/foods/FoodFilters';
import FoodTable from '../../components/foods/FoodTable';
import { useDeleteFood, useFoods } from '../../hooks/useFoods';
import { usePermission } from '../../hooks/usePermission';

const DEFAULT_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 350;

export default function FoodsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = usePermission();
  const canCreate = can('foods.create');
  const canUpdate = can('foods.update');
  const canDelete = can('foods.delete');
  const canManage = canCreate || canUpdate || canDelete;

  const page = Number(searchParams.get('page') ?? 1);
  const category = searchParams.get('category') ?? '';
  const isAvailable = searchParams.get('isAvailable') ?? '';
  const isVegetarian = searchParams.get('isVegetarian') ?? '';
  const isSpicy = searchParams.get('isSpicy') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const sortBy = searchParams.get('sortBy') ?? 'createdAt';
  const sortOrder = searchParams.get('sortOrder') ?? 'desc';
  const searchParam = searchParams.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(searchParam);
  const lastPushedRef = useRef(searchParam);

  useEffect(() => {
    if (searchParam === lastPushedRef.current) return;
    lastPushedRef.current = searchParam;
    setSearchInput(searchParam);
  }, [searchParam]);

  useEffect(() => {
    if (searchInput === searchParam) return;
    const id = setTimeout(() => {
      lastPushedRef.current = searchInput;
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
      ...(category ? { category } : {}),
      ...(isAvailable ? { isAvailable } : {}),
      ...(isVegetarian ? { isVegetarian } : {}),
      ...(isSpicy ? { isSpicy } : {}),
      ...(minPrice ? { minPrice } : {}),
      ...(maxPrice ? { maxPrice } : {}),
      ...(searchParam ? { search: searchParam } : {}),
      sortBy,
      sortOrder,
    }),
    [
      page,
      category,
      isAvailable,
      isVegetarian,
      isSpicy,
      minPrice,
      maxPrice,
      searchParam,
      sortBy,
      sortOrder,
    ],
  );

  const query = useFoods(params);
  const deleteMutation = useDeleteFood();
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

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
    setSearchInput('');
    lastPushedRef.current = '';
  }, [setSearchParams]);

  const hasActiveFilters = Boolean(
    searchParam || category || isAvailable || isVegetarian || isSpicy || minPrice || maxPrice,
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
        title="Foods"
        description="Manage the menu items."
        actions={
          canCreate ? (
            <Button onClick={() => navigate('/foods/new')}>
              <FontAwesomeIcon icon={faPlus} />
              Create food
            </Button>
          ) : null
        }
      />

      <Card className="mb-4">
        <FoodFilters
          search={searchInput}
          category={category}
          isAvailable={isAvailable}
          isVegetarian={isVegetarian}
          isSpicy={isSpicy}
          minPrice={minPrice}
          maxPrice={maxPrice}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchChange={setSearchInput}
          onCategoryChange={(v) => updateParam('category', v)}
          onIsAvailableChange={(v) => updateParam('isAvailable', v)}
          onIsVegetarianChange={(v) => updateParam('isVegetarian', v)}
          onIsSpicyChange={(v) => updateParam('isSpicy', v)}
          onMinPriceChange={(v) => updateParam('minPrice', v)}
          onMaxPriceChange={(v) => updateParam('maxPrice', v)}
          onSortByChange={(v) => updateParam('sortBy', v)}
          onSortOrderChange={(v) => updateParam('sortOrder', v)}
        />
      </Card>

      <Card className="p-0">
        {query.isError ? (
          <div className="p-4">
            <ErrorState
              title="Couldn’t load foods"
              message={query.error?.message}
              onRetry={() => query.refetch()}
            />
          </div>
        ) : (
          <FoodTable
            items={query.data?.items ?? []}
            loading={query.isLoading}
            canManage={canManage}
            hasActiveFilters={hasActiveFilters}
            onCreate={() => navigate('/foods/new')}
            onEdit={(food) => navigate(`/foods/${food._id}/edit`)}
            onDelete={(food) => setConfirmDelete(food)}
            onClearFilters={clearFilters}
          />
        )}

        {pagination && pagination.total > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <p className="text-text-muted">
              {pagination.total} item{pagination.total === 1 ? '' : 's'} · page {pagination.page} of{' '}
              {pagination.totalPages}
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

      <Dialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete food"
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
              <span className="font-medium text-text-primary">{confirmDelete.name}</span> and all
              its images.
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
