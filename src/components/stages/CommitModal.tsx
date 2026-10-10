'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface CommitModalProps {
  open: boolean;
  onClose: () => void;
  onCommit: (authorNote: string) => void;
  stageLabel: string;
  hasDownstreamCommitted: boolean;
}

export default function CommitModal({
  open,
  onClose,
  onCommit,
  stageLabel,
  hasDownstreamCommitted,
}: CommitModalProps) {
  const [note, setNote] = useState('');

  const handleCommit = () => {
    onCommit(note.trim());
    setNote('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Commit ${stageLabel}`}
      footer={
        <>
          <Button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-surface-700 bg-surface-100 hover:bg-surface-200 rounded-lg transition-colors"
          >
            Cancel
          </Button>
          <Button onClick={handleCommit}>
            Commit this version
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-surface-600">
          Committing locks this artifact and advances the pipeline. You can unlock it later if you need to make changes.
        </p>

        {hasDownstreamCommitted && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">Downstream stages may be affected</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Later stages that were built from a previous version of this artifact might need to be regenerated.
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="commit-note" className="block text-sm font-medium text-surface-700 mb-1.5">
            Author note (optional)
          </label>
          <textarea
            id="commit-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything future agents or reviewers should know about this version?"
            rows={3}
            className="w-full px-3 py-2 text-sm border border-surface-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}
