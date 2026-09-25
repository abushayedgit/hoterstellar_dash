import { useCategories } from '../../hooks/useCategories';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
];

export default function FoodFilters({
  search,
  category,
  isAvailable,
  isVegetarian,
  isSpicy,
  minPrice,
  maxPrice,
  sortBy,
  sortOrder,
  onSearchChange,
  onCategoryChange,
  onIsAvailableChange,
  onIsVegetarianChange,
  onIsSpicyChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortByChange,
  onSortOrderChange,
}) {
  // Category picker: reuse the Categories section's hook (limit high enough
  // to cover low-double-digit category counts).
  const categoriesQuery = useCategories({
    page: 1,
    limit: 100,
    sortBy: 'displayOrder',
    sortOrder: 'asc',
  });
  const categories = categoriesQuery.data?.items ?? [];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5 lg:col-span-2">
        <label htmlFor="foods-search" className="text-sm font-medium text-text-primary">
          Search
        </label>
        <input
          id="foods-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Name, description, tags"
          className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="foods-category" className="text-sm font-medium text-text-primary">
          Category
        </label>
        <select
          id="foods-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="foods-available" className="text-sm font-medium text-text-primary">
          Availability
        </label>
        <select
          id="foods-available"
          value={isAvailable}
          onChange={(e) => onIsAvailableChange(e.target.value)}
          className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
        >
          <option value="">All</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="foods-veg" className="text-sm font-medium text-text-primary">
          Vegetarian
        </label>
        <select
          id="foods-veg"
          value={isVegetarian}
          onChange={(e) => onIsVegetarianChange(e.target.value)}
          className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
        >
          <option value="">All</option>
          <option value="true">Vegetarian</option>
          <option value="false">Not vegetarian</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="foods-spicy" className="text-sm font-medium text-text-primary">
          Spicy
        </label>
        <select
          id="foods-spicy"
          value={isSpicy}
          onChange={(e) => onIsSpicyChange(e.target.value)}
          className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
        >
          <option value="">All</option>
          <option value="true">Spicy</option>
          <option value="false">Not spicy</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="foods-min" className="text-sm font-medium text-text-primary">
            Min price
          </label>
          <input
            id="foods-min"
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="foods-max" className="text-sm font-medium text-text-primary">
            Max price
          </label>
          <input
            id="foods-max"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="foods-sortby" className="text-sm font-medium text-text-primary">
          Sort by
        </label>
        <select
          id="foods-sortby"
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
        <label htmlFor="foods-sortorder" className="text-sm font-medium text-text-primary">
          Direction
        </label>
        <select
          id="foods-sortorder"
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
