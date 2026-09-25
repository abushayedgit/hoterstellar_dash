import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faPepperHot, faLeaf } from '@fortawesome/free-solid-svg-icons';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../shared/EmptyState';

const formatPrice = (n) => `$${Number(n ?? 0).toFixed(2)}`;

export default function FoodTable({
  items,
  loading,
  canManage,
  hasActiveFilters,
  onEdit,
  onDelete,
  onCreate,
  onClearFilters,
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-md bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return hasActiveFilters ? (
      <EmptyState
        title="No foods match your filters"
        message="Try clearing some filters to see more results."
        action={
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="No foods yet"
        message="Add your first food item to start building the menu."
        action={canManage ? <Button onClick={onCreate}>Create your first food</Button> : null}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-205 text-sm">
        <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Image</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Flags</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {canManage && <th className="px-4 py-3 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((food) => {
            const primary = food.images?.[0]?.url;
            const hasDiscount = (food.discount ?? 0) > 0;
            const discountedPrice = hasDiscount
              ? food.price * (1 - food.discount / 100)
              : food.price;

            return (
              <tr key={food._id} className="border-b border-border">
                <td className="px-4 py-3">
                  {primary ? (
                    <img
                      src={primary}
                      alt={food.name}
                      className="h-10 w-10 rounded-md object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-surface-muted" aria-hidden="true" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-text-primary">{food.name}</td>
                <td className="px-4 py-3 text-text-secondary">{food.category?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  {hasDiscount ? (
                    <span className="flex flex-col">
                      <span className="text-text-muted line-through">
                        {formatPrice(food.price)}
                      </span>
                      <span className="font-medium text-success">
                        {formatPrice(discountedPrice)}{' '}
                        <span className="text-xs">({food.discount}% off)</span>
                      </span>
                    </span>
                  ) : (
                    <span className="text-text-primary">{formatPrice(food.price)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-text-muted">
                    {food.isVegetarian && (
                      <FontAwesomeIcon icon={faLeaf} className="text-success" title="Vegetarian" />
                    )}
                    {food.isSpicy && (
                      <FontAwesomeIcon icon={faPepperHot} className="text-danger" title="Spicy" />
                    )}
                    {!food.isVegetarian && !food.isSpicy && '—'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={food.isAvailable ? 'success' : 'danger'}>
                    {food.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </td>
                {canManage && (
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${food.name}`}
                        onClick={() => onEdit(food)}
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${food.name}`}
                        onClick={() => onDelete(food)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-danger" />
                      </Button>
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
