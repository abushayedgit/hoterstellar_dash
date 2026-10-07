import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Dialog from '../../components/ui/Dialog';
import ErrorState from '../../components/shared/ErrorState';
import LoadingState from '../../components/shared/LoadingState';
import FoodImageUploader, { MAX_IMAGES_PER_FOOD } from '../../components/foods/FoodImageUploader';
import TagInput from '../../components/foods/TagInput';
import { foodSchema } from '../../schemas/food';
import { useCreateFood, useDeleteFoodImage, useFood, useUpdateFood } from '../../hooks/useFoods';
import { useCategories } from '../../hooks/useCategories';
import { ApiError } from '../../api/client/normalizeError';
import { applyServerFieldErrors } from '../../utils/formErrors';

const NUTRITION_KEYS = ['calories', 'protein', 'carbs', 'fat'];

const buildNutritionalInfo = (values) => {
  const info = {};
  for (const key of NUTRITION_KEYS) {
    const v = values[key];
    if (v === '' || v == null) continue;
    info[key] = Number(v);
  }
  return Object.keys(info).length > 0 ? info : null;
};

const buildFormData = ({ values, files, isEdit }) => {
  const fd = new FormData();
  fd.append('name', values.name);
  fd.append('description', values.description);
  fd.append('price', String(values.price));
  fd.append('category', values.category);
  fd.append('isAvailable', String(Boolean(values.isAvailable)));
  fd.append('isVegetarian', String(Boolean(values.isVegetarian)));
  fd.append('isSpicy', String(Boolean(values.isSpicy)));
  fd.append('preparationTime', String(values.preparationTime));
  fd.append('discount', String(values.discount));
  fd.append('ingredients', JSON.stringify(values.ingredients ?? []));
  fd.append('tags', JSON.stringify(values.tags ?? []));

  const nutritional = buildNutritionalInfo(values);
  if (nutritional) fd.append('nutritionalInfo', JSON.stringify(nutritional));

  // New files are appended by the backend. Send only the user's pending
  // selections; existing images are preserved server-side.
  for (const file of files) fd.append('images', file);

  void isEdit;
  return fd;
};

function Section({ title, description, children }) {
  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {description && <p className="text-xs text-text-muted">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

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
  const deleteImageMutation = useDeleteFoodImage();

  const [files, setFiles] = useState([]);
  const [imageError, setImageError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [confirmDeleteImage, setConfirmDeleteImage] = useState(null);

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
      category: '',
      price: 0,
      discount: 0,
      isAvailable: true,
      isVegetarian: false,
      isSpicy: false,
      preparationTime: 15,
      ingredients: [],
      tags: [],
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    },
  });

  useEffect(() => {
    if (!isEdit || !foodQuery.data) return;
    const food = foodQuery.data;
    const n = food.nutritionalInfo ?? {};
    reset({
      name: food.name ?? '',
      description: food.description ?? '',
      category: food.category?._id ?? food.category ?? '',
      price: food.price ?? 0,
      discount: food.discount ?? 0,
      isAvailable: food.isAvailable ?? true,
      isVegetarian: food.isVegetarian ?? false,
      isSpicy: food.isSpicy ?? false,
      preparationTime: food.preparationTime ?? 15,
      ingredients: Array.isArray(food.ingredients) ? food.ingredients : [],
      tags: Array.isArray(food.tags) ? food.tags : [],
      calories: n.calories ?? '',
      protein: n.protein ?? '',
      carbs: n.carbs ?? '',
      fat: n.fat ?? '',
    });
  }, [isEdit, foodQuery.data, reset]);

  const existingImages = useMemo(
    () => (isEdit ? (foodQuery.data?.images ?? []) : []),
    [isEdit, foodQuery.data],
  );

  const onSubmit = async (values) => {
    setImageError(null);
    setFormError(null);

    const totalImages = existingImages.length + files.length;
    if (!isEdit && files.length === 0) {
      setImageError('At least one image is required');
      return;
    }
    if (totalImages > MAX_IMAGES_PER_FOOD) {
      setImageError(`At most ${MAX_IMAGES_PER_FOOD} images are allowed`);
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

  const onConfirmDeleteImage = async () => {
    if (!confirmDeleteImage || !id) return;
    try {
      await deleteImageMutation.mutateAsync({
        foodId: id,
        imageId: confirmDeleteImage.fileId,
      });
    } finally {
      setConfirmDeleteImage(null);
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
        <Section title="Basic information">
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
        </Section>

        <Section title="Pricing & availability">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              id="food-price"
              type="number"
              step="0.01"
              label="Price"
              error={errors.price?.message}
              {...register('price')}
            />
            <Input
              id="food-discount"
              type="number"
              min="0"
              max="100"
              label="Discount (%)"
              error={errors.discount?.message}
              {...register('discount')}
            />
            <Input
              id="food-prep"
              type="number"
              min="1"
              label="Prep time (min)"
              error={errors.preparationTime?.message}
              {...register('preparationTime')}
            />
          </div>

          <fieldset className="flex flex-wrap gap-4 pt-1">
            <legend className="sr-only">Flags</legend>
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
          </fieldset>
        </Section>

        <Section
          title="Images"
          description={
            isEdit
              ? 'Add new images to keep the existing ones. Delete individual images below.'
              : `1–${MAX_IMAGES_PER_FOOD} images, max 5 MB each.`
          }
        >
          <FoodImageUploader
            files={files}
            setFiles={setFiles}
            existingImages={existingImages}
            onRequestDeleteExisting={(img) => setConfirmDeleteImage(img)}
            deletingImageId={
              deleteImageMutation.isPending
                ? (deleteImageMutation.variables?.imageId ?? null)
                : null
            }
            error={imageError}
          />
        </Section>

        <Section title="Ingredients & tags">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Ingredients</label>
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
              <label className="text-sm font-medium text-text-primary">Tags</label>
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
        </Section>

        <Section
          title="Nutritional information"
          description="All fields optional. Leave blank if unknown."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Input
              id="food-calories"
              type="number"
              min="0"
              label="Calories"
              error={errors.calories?.message}
              {...register('calories')}
            />
            <Input
              id="food-protein"
              type="number"
              min="0"
              label="Protein (g)"
              error={errors.protein?.message}
              {...register('protein')}
            />
            <Input
              id="food-carbs"
              type="number"
              min="0"
              label="Carbs (g)"
              error={errors.carbs?.message}
              {...register('carbs')}
            />
            <Input
              id="food-fat"
              type="number"
              min="0"
              label="Fat (g)"
              error={errors.fat?.message}
              {...register('fat')}
            />
          </div>
        </Section>

        {formError && (
          <p
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
          >
            {formError}
          </p>
        )}

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

      <Dialog
        open={Boolean(confirmDeleteImage)}
        onClose={() => setConfirmDeleteImage(null)}
        title="Delete image"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmDeleteImage(null)}
              disabled={deleteImageMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteImageMutation.isPending}
              onClick={onConfirmDeleteImage}
            >
              Delete image
            </Button>
          </div>
        }
      >
        {confirmDeleteImage && (
          <div className="flex flex-col gap-3 text-sm text-text-secondary">
            <img
              src={confirmDeleteImage.url}
              alt="Image to delete"
              className="h-32 w-32 rounded-lg object-cover"
            />
            <p className="text-danger">
              This permanently removes the image from ImageKit and cannot be undone.
            </p>
          </div>
        )}
      </Dialog>
    </PageContainer>
  );
}
