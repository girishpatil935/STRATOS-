import React, { useRef, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import type { SelectedFile } from '../../types/newAnalysis';

interface DocumentUploadProps {
  files: SelectedFile[];
  onAdd: (files: FileList | File[]) => void;
  onRemove: (id: string) => void;
  fileErrors: string[];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EXT_ICON: Record<string, string> = {
  pdf:  '📄',
  docx: '📝',
  txt:  '📃',
};

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  files,
  onAdd,
  onRemove,
  fileErrors,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files);
  };

  const handleBrowse = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onAdd(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Heading */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Upload size={17} className="text-black" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-black">Supporting Documents</h2>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 border border-neutral-200 rounded px-1.5 py-0.5">
              Optional
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">
            Upload PDF, DOCX, or TXT files — financial reports, strategy decks, market research,
            or any documents relevant to your analysis.
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleBrowse}
        onKeyDown={e => e.key === 'Enter' && handleBrowse()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          'relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 px-6 cursor-pointer transition-all duration-200 select-none',
          isDragging
            ? 'border-burgundy bg-burgundy/[0.03] scale-[1.01]'
            : 'border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100',
        ].join(' ')}
      >
        <div className={[
          'w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-200',
          isDragging ? 'bg-burgundy' : 'bg-white border border-neutral-200',
        ].join(' ')}>
          <Upload size={22} className={isDragging ? 'text-white' : 'text-neutral-400'} />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-black">
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            or{' '}
            <span className="text-black font-medium underline underline-offset-2">
              click to browse
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {['PDF', 'DOCX', 'TXT'].map(ext => (
            <span
              key={ext}
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white border border-neutral-200 text-neutral-500"
            >
              {ext}
            </span>
          ))}
          <span className="text-[10px] text-neutral-400">· Max 10 MB per file</span>
        </div>

        {/* Hidden native input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload documents"
        />
      </div>

      {/* File validation errors */}
      {fileErrors.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-1">
          {fileErrors.map((err, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-neutral-600">
              <AlertCircle size={13} className="text-burgundy mt-0.5 flex-shrink-0" />
              <span>{err}</span>
            </div>
          ))}
        </div>
      )}

      {/* Selected file list */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-black uppercase tracking-widest">
            {files.length} {files.length === 1 ? 'file' : 'files'} selected
          </p>
          {files.map(sf => (
            <div
              key={sf.id}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 group hover:border-neutral-300 transition-colors"
            >
              {/* Icon */}
              <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 text-base">
                {EXT_ICON[sf.extension] ?? '📎'}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-black truncate">{sf.name}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  <span className="uppercase font-semibold">{sf.extension}</span>
                  {' · '}
                  {formatBytes(sf.size)}
                </p>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => onRemove(sf.id)}
                aria-label={`Remove ${sf.name}`}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-300 hover:text-burgundy hover:bg-neutral-50 transition-all duration-150 flex-shrink-0"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && (
        <p className="text-[11px] text-neutral-400">
          Documents are processed server-side. Supported formats: PDF, DOCX, TXT.
          Files are sent together with your business context in a single request.
        </p>
      )}
    </div>
  );
};

export default DocumentUpload;
