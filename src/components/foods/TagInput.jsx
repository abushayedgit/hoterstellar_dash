import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPlus } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/Button';

export default function TagInput({ value = [], onChange, placeholder = 'Add item', id }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...value, trimmed]);
    setDraft('');
  };

  const remove = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-10 flex-1 rounded-lg border border-input-border bg-input-bg px-3 text-sm text-text-primary focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/40"
        />
        <Button type="button" variant="outline" onClick={add}>
          <FontAwesomeIcon icon={faPlus} />
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-xs text-text-primary"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                className="text-text-muted hover:text-danger"
                aria-label={`Remove ${tag}`}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
