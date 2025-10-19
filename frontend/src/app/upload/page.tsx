"use client";
import { useState } from "react";
import { useUpload } from "../../context/UploadContext";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pagesToProcess, setPagesToProcess] = useState("");
  const { uploadFile, uploadStatus } = useUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    uploadFile(file, pagesToProcess);
  };

  const renderStatus = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <div className="flex justify-center items-center p-4">
            <svg className="animate-spin h-8 w-8 text-slate-600 dark:text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="ml-3 text-slate-600 dark:text-slate-300">Uploading...</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex justify-center items-center p-4 text-emerald-500 dark:text-emerald-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="ml-3">Upload successful!</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex justify-center items-center p-4 text-red-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="ml-3">Upload failed.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-81px)] p-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">
          Upload Document
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Choose a file to upload
            </label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-slate-600 dark:text-slate-300">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white dark:bg-slate-900 rounded-md font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PDF, PNG, JPG, GIF, BMP up to 10MB
                </p>
              </div>
            </div>
          </div>
          <div>
            <label
              htmlFor="pages-to-process"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Pages to process (for PDF, optional)
            </label>
            <input
              id="pages-to-process"
              name="pages-to-process"
              type="number"
              value={pagesToProcess}
              onChange={(e) => setPagesToProcess(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-slate-800 dark:text-slate-100"
              placeholder="e.g., 5"
            />
          </div>
          {file && (
            <div className="text-sm text-slate-500 dark:text-slate-300">
              Selected file: {file.name}
            </div>
          )}
          {uploadStatus === 'idle' && <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-br from-emerald-500 to-teal-600 hover:shadow-lg disabled:opacity-50 transition-all"
              disabled={!file}
            >
              Upload
            </button>
          </div>}
        </form>
        <div className="mt-6">
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}
