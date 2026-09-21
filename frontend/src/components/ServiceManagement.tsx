import React, { useState } from 'react';
import { useAddServiceSpecialtyMutation, useRemoveServiceSpecialtyMutation } from '../store/bookingApi';

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
  const [addService, { isLoading: isAdding }] = useAddServiceSpecialtyMutation();
  const [removeService, { isLoading: isRemoving }] = useRemoveServiceSpecialtyMutation();
  const [newSpecialty, setNewSpecialty] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSpecialty.trim();
    if (!trimmed) return;

    try {
      await addService({ specialty: trimmed }).unwrap();
      setNewSpecialty('');
      setError(null);
      onAddService?.(trimmed);
    } catch {
      setError('Failed to add service');
    }
  };

  const handleRemove = async (specialty: string) => {
    try {
      await removeService({ specialty }).unwrap();
      setError(null);
      onRemoveService?.(specialty);
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
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
            >
              {specialty}
              <button
                onClick={() => handleRemove(specialty)}
                disabled={isRemoving}
                className="text-primary/60 hover:text-primary disabled:opacity-50"
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
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isAdding}
        />
        <button
          type="submit"
          disabled={isAdding || !newSpecialty.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isAdding ? 'Adding...' : 'Add'}
        </button>
      </form>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default ServiceManagement;