/* eslint-disable react-refresh/only-export-components */
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faTrash } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';

export const MAX_IMAGES_PER_FOOD = 8;

export default function FoodImageUploader({
  files,
  setFiles,
  existingImages = [],
  onRequestDeleteExisting,
  deletingImageId,
  error,
  id = 'food-images',
}) {
  const totalCount = existingImages.length + files.length;
  const remainingSlots = Math.max(0, MAX_IMAGES_PER_FOOD - totalCount);
  const canDeleteExisting = existingImages.length > 1;

  const previews = files.map((f) => ({ url: URL.createObjectURL(f), file: f }));

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const onPick = (e) => {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    const accepted = picked.slice(0, remainingSlots);
    setFiles([...files, ...accepted]);
    e.target.value = '';
  };

  const removePending = (idx) => setFiles(files.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-4">
      {existingImages.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-text-muted">
            {existingImages.length} existing image{existingImages.length === 1 ? '' : 's'}. Deleting
            is permanent and cannot be undone.
          </p>
          <ul className="flex flex-wrap gap-3">
            {existingImages.map((img, i) => {
              const isDeleting = deletingImageId === img.fileId;
              const disableDelete = !canDeleteExisting || isDeleting;
              const title = !canDeleteExisting
                ? 'Food must keep at least one image'
                : 'Delete this image';
              return (
                <li key={img.fileId ?? i} className="relative">
                  <img
                    src={img.url}
                    alt={`Existing ${i + 1}`}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="icon"
                    disabled={disableDelete}
                    title={title}
                    aria-label={`Delete image ${i + 1}`}
                    onClick={() => onRequestDeleteExisting?.(img)}
                    className="absolute -right-2 -top-2 h-7 w-7"
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {previews.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-text-muted">
            {previews.length} new image{previews.length === 1 ? '' : 's'} pending upload.
          </p>
          <ul className="flex flex-wrap gap-3">
            {previews.map((p, i) => (
              <li key={p.url} className="relative">
                <img
                  src={p.url}
                  alt={`New ${i + 1}`}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePending(i)}
                  className="absolute -right-2 -top-2 rounded-full bg-danger px-2 py-1 text-xs text-white"
                  aria-label={`Remove pending image ${i + 1}`}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {remainingSlots > 0 ? (
        <input
          id={id}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onPick}
          className="text-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-2 file:text-text-primary"
        />
      ) : (
        <p className="text-xs text-text-muted">
          Maximum of {MAX_IMAGES_PER_FOOD} images reached. Delete one to add another.
        </p>
      )}

      <p className="text-xs text-text-muted">
        {totalCount}/{MAX_IMAGES_PER_FOOD} total. Max 5 MB per image.
      </p>

      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
