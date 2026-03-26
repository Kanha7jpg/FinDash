import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type CreateWatchlistFormProps = {
  onCreate: (name: string, description?: string) => Promise<void>;
  busy: boolean;
};

export function CreateWatchlistForm({ onCreate, busy }: CreateWatchlistFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <form
      className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={async (event) => {
        event.preventDefault();

        const normalizedName = name.trim();

        if (!normalizedName) {
          return;
        }

        await onCreate(normalizedName, description.trim() || undefined);
        setName('');
        setDescription('');
      }}
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Create Watchlist</h2>
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Growth Picks"
        maxLength={60}
        required
      />
      <Input
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Optional description"
        maxLength={280}
      />
      <Button type="submit" disabled={busy || !name.trim()} className="w-full rounded-lg">
        {busy ? 'Saving...' : 'Create'}
      </Button>
    </form>
  );
}
