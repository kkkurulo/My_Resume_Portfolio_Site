"use client";

export function DeleteButton({ action, name, className }: { action: () => Promise<void>; name: string; className: string }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${name}”? This can't be undone.`)) event.preventDefault();
      }}
    >
      <button type="submit" className={className}>
        Delete
      </button>
    </form>
  );
}
