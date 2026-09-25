import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import EmptyState from '../shared/EmptyState';

export default function CategoryTable({ items, loading, canManage, onEdit, onDelete, onCreate }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="No categories yet"
        message="Create the first category to start organizing your menu."
        action={canManage ? <Button onClick={onCreate}>Create category</Button> : null}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-160 text-sm">
        <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Image</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Slug</th>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Status</th>
            {canManage && <th className="px-4 py-3 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((cat) => (
            <tr key={cat._id} className="border-b border-border">
              <td className="px-4 py-3">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-10 w-10 rounded-md object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-surface-muted" aria-hidden="true" />
                )}
              </td>
              <td className="px-4 py-3 font-medium text-text-primary">{cat.name}</td>
              <td className="px-4 py-3 text-text-muted">{cat.slug}</td>
              <td className="px-4 py-3 text-text-secondary">{cat.displayOrder ?? 0}</td>
              <td className="px-4 py-3">
                <Badge tone={cat.isActive ? 'success' : 'danger'}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              {canManage && (
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${cat.name}`}
                      onClick={() => onEdit(cat)}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${cat.name}`}
                      onClick={() => onDelete(cat)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-danger" />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
