import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept: string;
  multiple?: boolean;
  onChange: (files: FileList | null) => void;
  selectedFiles?: FileList | File | null;
}

export const FileUpload = ({ label, accept, multiple = false, onChange, selectedFiles }: FileUploadProps) => {
  const getFileCount = () => {
    if (!selectedFiles) return 0;
    if (selectedFiles instanceof FileList) return selectedFiles.length;
    return 1;
  };

  const fileCount = getFileCount();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => onChange(e.target.files)}
          className="hidden"
          id={`file-${label}`}
        />
        <label
          htmlFor={`file-${label}`}
          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <div className="flex items-center space-x-3">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {fileCount > 0 ? `${fileCount} file(s) selected` : 'Click to upload'}
            </span>
          </div>
        </label>
      </div>
      {fileCount > 0 && (
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <FileText className="w-4 h-4" />
          <span>Ready to process</span>
        </div>
      )}
    </div>
  );
};
