const SORT_OPTIONS = [
  { value: 'displayOrder', label: 'Display order' },
  { value: 'name', label: 'Name' },
  { value: 'createdAt', label: 'Created' },
];

export default function CategoryFilters({
  isActive,
  sortBy,
  sortOrder,
  onIsActiveChange,
  onSortByChange,
  onSortOrderChange,
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cat-active" className="text-sm font-medium text-text-primary">
          Status
        </label>
        <select
          id="cat-active"
          value={isActive}
          onChange={(e) => onIsActiveChange(e.target.value)}
          className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cat-sortby" className="text-sm font-medium text-text-primary">
          Sort by
        </label>
        <select
          id="cat-sortby"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cat-sortorder" className="text-sm font-medium text-text-primary">
          Direction
        </label>
        <select
          id="cat-sortorder"
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
          className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
}
