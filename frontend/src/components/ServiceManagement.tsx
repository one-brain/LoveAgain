import React, { useState } from 'react';

interface ServiceManagementProps {
  specialties: string[];
  onAddService?: (specialty: string) => void;
  onRemoveService?: (specialty: string) => void;
}

export const ServiceManagement: React.FC<ServiceManagementProps> = ({
  specialties,
  onAddService,
  onRemoveService,
}) => {
  const [newSpecialty, setNewSpecialty] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSpecialty.trim();
    if (!trimmed) return;

    if (specialties.includes(trimmed)) {
      setError('This service already exists');
      return;
    }

    setError(null);
    try {
      await onAddService?.(trimmed);
      setNewSpecialty('');
    } catch {
      setError('Failed to add service');
    }
  };

  const handleRemove = async (specialty: string) => {
    setError(null);
    try {
      await onRemoveService?.(specialty);
    } catch {
      setError('Failed to remove service');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {specialties.length === 0 ? (
          <p className="text-sm text-muted-foreground">No services yet. Add your first one below.</p>
        ) : (
          specialties.map((specialty) => (
            <div
              key={specialty}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-accent/10 text-accent border border-accent/20 transition-all duration-200"
            >
              {specialty}
              <button
                onClick={() => handleRemove(specialty)}
                className="text-accent/60 hover:text-accent transition-colors"
                aria-label={`Remove ${specialty}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newSpecialty}
          onChange={(e) => setNewSpecialty(e.target.value)}
          placeholder="Add a service (e.g. Yoga, Massage, Cooking)"
          className="flex-1 rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          disabled={specialties.length >= 20}
        />
        <button
          type="submit"
          disabled={specialties.length >= 20 || !newSpecialty.trim()}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default ServiceManagement;