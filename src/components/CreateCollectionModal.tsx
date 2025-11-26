import { useState, useEffect } from 'react';

// Gemini Dark Theme Colors
const COLORS = {
  background: '#131314',
  surface: '#1E1F20',
  input: '#282A2C',
  textPrimary: '#E3E3E3',
  textSecondary: '#C4C7C5',
  accent: '#A8C7FA',
  border: '#444746',
  buttonPrimary: '#8AB4F8',
  buttonPrimaryText: '#041E49',
  error: '#F2B8B5',
  errorBg: '#8C1D18',
  chip: '#3C4043',
  chipHover: '#4A4E52',
};

// Suggestion chips for common categories
const CATEGORY_SUGGESTIONS = [
  { label: 'Investing', icon: '📈' },
  { label: 'Homework', icon: '🎓' },
  { label: 'Writing', icon: '✍️' },
  { label: 'Health', icon: '💪' },
  { label: 'Travel', icon: '✈️' },
];

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export function CreateCollectionModal({
  isOpen,
  onClose,
  onSave,
}: CreateCollectionModalProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onSave(name.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (label: string) => {
    setName(label);
  };

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: COLORS.input,
    border: 'none',
    borderRadius: '24px',
    color: COLORS.textPrimary,
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: COLORS.textSecondary,
    marginBottom: '8px',
    paddingLeft: '4px',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10001,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10002,
          padding: '16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: COLORS.surface,
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: COLORS.textPrimary,
                margin: 0,
              }}
            >
              Create New Collection
            </h3>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                color: COLORS.textSecondary,
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <label style={labelStyle}>Collection Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                placeholder="Enter collection name"
                required
                autoFocus
              />
            </div>

            {/* Suggestion Chips */}
            <div>
              <label style={{ ...labelStyle, marginBottom: '12px' }}>
                Quick Suggestions
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {CATEGORY_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    type="button"
                    onClick={() => handleChipClick(suggestion.label)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      backgroundColor: COLORS.chip,
                      color: COLORS.textPrimary,
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 400,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.chipHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.chip;
                    }}
                  >
                    <span>{suggestion.icon}</span>
                    <span>{suggestion.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: COLORS.errorBg,
                  borderRadius: '12px',
                }}
              >
                <p style={{ fontSize: '13px', color: COLORS.error, margin: 0 }}>{error}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  backgroundColor: COLORS.input,
                  color: COLORS.textPrimary,
                  border: 'none',
                  borderRadius: '24px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  backgroundColor: COLORS.buttonPrimary,
                  color: COLORS.buttonPrimaryText,
                  border: 'none',
                  borderRadius: '24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isLoading || !name.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !name.trim() ? 0.5 : 1,
                  transition: 'background-color 0.2s',
                }}
              >
                {isLoading ? 'Creating...' : 'Create Collection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreateCollectionModal;
