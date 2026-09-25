import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema } from '../../schemas/category';
import { useCreateCategory, useUpdateCategory } from '../../hooks/useCategories';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { ApiError } from '../../api/client/normalizeError';
import { applyServerFieldErrors } from '../../utils/formErrors';

const buildFormData = (values, imageFile) => {
  const fd = new FormData();
  fd.append('name', values.name);
  fd.append('description', values.description ?? '');
  fd.append('isActive', String(values.isActive));
  fd.append('displayOrder', String(values.displayOrder ?? 0));
  if (imageFile) fd.append('image', imageFile);
  return fd;
};

export default function CategoryForm({ mode = 'create', category, onSuccess, onCancel }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(category?.image ?? null);
  const [formError, setFormError] = useState(null);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
      isActive: category?.isActive ?? true,
      displayOrder: category?.displayOrder ?? 0,
    },
  });

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl(isEdit ? (category?.image ?? null) : null);
  };

  const onSubmit = async (values) => {
    setFormError(null);
    const fd = buildFormData(values, imageFile);
    try {
      if (isEdit) await updateMutation.mutateAsync({ id: category._id, formData: fd });
      else await createMutation.mutateAsync(fd);
      onSuccess?.();
    } catch (err) {
      const handled = applyServerFieldErrors(err, setError);
      if (!handled) {
        setFormError(
          err instanceof ApiError ? err.message : 'Unable to save category. Please try again.',
        );
      }
    }
  };

  const submitting = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input id="cat-name" label="Name" error={errors.name?.message} {...register('name')} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cat-description" className="text-sm font-medium text-text-primary">
          Description
        </label>
        <textarea
          id="cat-description"
          rows={3}
          className="rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="cat-order"
          type="number"
          label="Display order"
          error={errors.displayOrder?.message}
          {...register('displayOrder')}
        />
        <label className="mt-6 flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-input-border text-primary focus:ring-focus"
            {...register('isActive')}
          />
          Active
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="cat-image" className="text-sm font-medium text-text-primary">
          Image {isEdit && <span className="text-text-muted">(leave empty to keep current)</span>}
        </label>
        {previewUrl && (
          <div className="relative inline-block w-fit">
            <img
              src={previewUrl}
              alt="Category preview"
              className="h-24 w-24 rounded-lg object-cover"
            />
            {imageFile && (
              <button
                type="button"
                onClick={clearImage}
                className="absolute -right-2 -top-2 rounded-full bg-danger px-2 py-0.5 text-xs text-white"
                aria-label="Remove selected image"
              >
                Remove
              </button>
            )}
          </div>
        )}
        <input
          id="cat-image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onPickImage}
          className="text-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-2 file:text-text-primary"
        />
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {formError}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create category'}
        </Button>
      </div>
    </form>
  );
}
