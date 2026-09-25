import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const MAX_IMAGES = 8;

export default function FoodImageUploader({
  files,
  setFiles,
  existingImages = [],
  error,
  id = 'food-images',
}) {
  const remainingSlots = MAX_IMAGES - files.length;
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

  const remove = (idx) => setFiles(files.filter((_, i) => i !== idx));

  return (
    <div className="flex flex-col gap-2">
      {existingImages.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-text-muted">
            Current images will be replaced if you upload new ones.
          </p>
          <ul className="flex flex-wrap gap-2">
            {existingImages.map((img, i) => (
              <li key={img.fileId ?? i}>
                <img
                  src={img.url}
                  alt={`Current ${i + 1}`}
                  className="h-20 w-20 rounded-lg object-cover opacity-80"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {previews.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {previews.map((p, i) => (
            <li key={p.url} className="relative">
              <img src={p.url} alt={`New ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -right-2 -top-2 rounded-full bg-danger px-2 py-0.5 text-white"
                aria-label={`Remove image ${i + 1}`}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {remainingSlots > 0 && (
        <input
          id={id}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onPick}
          className="text-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-2 file:text-text-primary"
        />
      )}

      <p className="text-xs text-text-muted">
        {files.length}/{MAX_IMAGES} selected. Max 5 MB per image.
      </p>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
