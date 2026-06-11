import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <Loader2 size={48} className="animate-spin text-accent-primary mb-4" />
      <h2 className="text-xl font-semibold text-muted">Loading Dashboard...</h2>
      <p className="text-sm text-muted opacity-60">Please wait while we fetch the latest data.</p>
    </div>
  );
}
