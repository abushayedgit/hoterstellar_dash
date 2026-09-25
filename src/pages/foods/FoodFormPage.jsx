import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ErrorState from '../../components/shared/ErrorState';
import LoadingState from '../../components/shared/LoadingState';
import FoodImageUploader from '../../components/foods/FoodImageUploader';
import TagInput from '../../components/foods/TagInput';
import { foodSchema } from '../../schemas/food';
import { useCreateFood, useFood, useUpdateFood } from '../../hooks/useFoods';
import { useCategories } from '../../hooks/useCategories';
import { ApiError } from '../../api/client/normalizeError';
import { applyServerFieldErrors } from '../../utils/formErrors';

const buildFormData = ({ values, files, isEdit, existingIngredients, existingTags }) => {
  const fd = new FormData();
  fd.append('name', values.name);
  fd.append('description', values.description);
  fd.append('price', String(values.price));
  fd.append('category', values.category);
  fd.append('isAvailable', String(values.isAvailable));
  fd.append('isVegetarian', String(values.isVegetarian));
  fd.append('isSpicy', String(values.isSpicy));
  fd.append('preparationTime', String(values.preparationTime));
  fd.append('discount', String(values.discount));
  fd.append('ingredients', JSON.stringify(values.ingredients ?? []));
  fd.append('tags', JSON.stringify(values.tags ?? []));

  // Only append images when the user actually picked new files. On edit,
  // sending nothing preserves the existing images.
  if (!isEdit || files.length > 0) {
    for (const file of files) fd.append('images', file);
  }

  // Silence unused-variable lints for values we do not need to send.
  void existingIngredients;
  void existingTags;

  return fd;
};

export default function FoodFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const foodQuery = useFood(isEdit ? id : undefined);
  const categoriesQuery = useCategories({
    page: 1,
    limit: 100,
    sortBy: 'displayOrder',
    sortOrder: 'asc',
  });
  const categories = categoriesQuery.data?.items ?? [];

  const createMutation = useCreateFood();
  const updateMutation = useUpdateFood();

  const [files, setFiles] = useState([]);
  const [imageError, setImageError] = useState(null);
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(foodSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      isAvailable: true,
      isVegetarian: false,
      isSpicy: false,
      preparationTime: 15,
      discount: 0,
      ingredients: [],
      tags: [],
    },
  });

  // Hydrate form once the food has loaded in edit mode.
  useEffect(() => {
    if (!isEdit || !foodQuery.data) return;
    const food = foodQuery.data;
    reset({
      name: food.name ?? '',
      description: food.description ?? '',
      price: food.price ?? 0,
      category: food.category?._id ?? food.category ?? '',
      isAvailable: food.isAvailable ?? true,
      isVegetarian: food.isVegetarian ?? false,
      isSpicy: food.isSpicy ?? false,
      preparationTime: food.preparationTime ?? 15,
      discount: food.discount ?? 0,
      ingredients: Array.isArray(food.ingredients) ? food.ingredients : [],
      tags: Array.isArray(food.tags) ? food.tags : [],
    });
  }, [isEdit, foodQuery.data, reset]);

  const existingImages = useMemo(
    () => (isEdit ? (foodQuery.data?.images ?? []) : []),
    [isEdit, foodQuery.data],
  );

  const onSubmit = async (values) => {
    setImageError(null);
    setFormError(null);

    // Client-side image rule mirrors the backend requirement on create.
    if (!isEdit && files.length === 0) {
      setImageError('At least one image is required');
      return;
    }

    const fd = buildFormData({ values, files, isEdit });
    try {
      if (isEdit) await updateMutation.mutateAsync({ id, formData: fd });
      else await createMutation.mutateAsync(fd);
      navigate('/foods');
    } catch (err) {
      const handled = applyServerFieldErrors(err, setError);
      if (!handled) {
        setFormError(
          err instanceof ApiError ? err.message : 'Unable to save food. Please try again.',
        );
      }
    }
  };

  if (isEdit && foodQuery.isLoading) return <LoadingState />;
  if (isEdit && foodQuery.isError) {
    return (
      <PageContainer>
        <ErrorState
          title="Couldn’t load food"
          message={foodQuery.error?.message}
          onRetry={() => foodQuery.refetch()}
        />
      </PageContainer>
    );
  }

  const submitting = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <PageContainer>
      <PageHeader
        title={isEdit ? 'Edit food' : 'Create food'}
        description={isEdit ? 'Update menu item details.' : 'Add a new item to the menu.'}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Card className="flex flex-col gap-4">
          <Input id="food-name" label="Name" error={errors.name?.message} {...register('name')} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="food-description" className="text-sm font-medium text-text-primary">
              Description
            </label>
            <textarea
              id="food-description"
              rows={4}
              className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
              {...register('description')}
            />
            {errors.description && (
              <p role="alert" className="text-xs text-danger">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              id="food-price"
              type="number"
              step="0.01"
              label="Price"
              error={errors.price?.message}
              {...register('price')}
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="food-category" className="text-sm font-medium text-text-primary">
                Category
              </label>
              <select
                id="food-category"
                className="h-10 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
                {...register('category')}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p role="alert" className="text-xs text-danger">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              id="food-prep"
              type="number"
              label="Prep time (min)"
              error={errors.preparationTime?.message}
              {...register('preparationTime')}
            />
            <Input
              id="food-discount"
              type="number"
              label="Discount (%)"
              error={errors.discount?.message}
              {...register('discount')}
            />
            <div className="flex flex-col gap-2 pt-6">
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input-border text-primary focus:ring-focus"
                  {...register('isAvailable')}
                />
                Available
              </label>
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input-border text-primary focus:ring-focus"
                  {...register('isVegetarian')}
                />
                Vegetarian
              </label>
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input-border text-primary focus:ring-focus"
                  {...register('isSpicy')}
                />
                Spicy
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">
              {isEdit ? 'Images (uploading new ones replaces all existing)' : 'Images'}
            </label>
            <FoodImageUploader
              files={files}
              setFiles={setFiles}
              existingImages={existingImages}
              error={imageError}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="food-ingredients" className="text-sm font-medium text-text-primary">
                Ingredients
              </label>
              <Controller
                name="ingredients"
                control={control}
                render={({ field }) => (
                  <TagInput
                    id="food-ingredients"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="e.g. basmati rice"
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="food-tags" className="text-sm font-medium text-text-primary">
                Tags
              </label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput
                    id="food-tags"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="e.g. bestseller"
                  />
                )}
              />
            </div>
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
            >
              {formError}
            </p>
          )}
        </Card>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/foods')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting} disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create food'}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}
