import { useTheme } from '../contexts/ThemeContext';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const { theme } = useTheme();

  if (!open) return null;

  const isDark = theme === 'dark';
  const overlay = isDark ? 'bg-black/60' : 'bg-black/40';
  const card = isDark ? 'bg-[#1F2937] border-[#374151]' : 'bg-white border-gray-200';
  const titleClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const messageClass = isDark ? 'text-gray-300' : 'text-gray-600';
  const cancelBtn = isDark
    ? 'bg-gray-600 hover:bg-gray-500 text-white border border-gray-500'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300';
  const confirmBtn = isDark
    ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500'
    : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-600';

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${overlay}`}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className={`max-w-md w-full rounded-xl border shadow-xl p-6 ${card}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className={`text-lg font-semibold mb-2 ${titleClass}`}>
          {title}
        </h2>
        <p className={`text-sm mb-6 max-h-64 overflow-y-auto whitespace-pre-wrap break-words ${messageClass}`}>{message}</p>
        <div className="flex justify-end gap-3">
          {cancelLabel ? (
            <button
              type="button"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${cancelBtn}`}
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${confirmBtn}`}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
