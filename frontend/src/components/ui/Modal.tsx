import type { PropsWithChildren } from 'react';

type ModalProps = PropsWithChildren<{
  title: string;
  onClose: () => void;
}>;

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700" type="button">
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
