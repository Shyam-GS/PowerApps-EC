import { useState } from 'react';
import { Users, Settings } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ResultsDisplay } from './components/ResultsDisplay';
import { parseCsvFile, parseJsonFiles } from './utils/fileParser';
import { ComparisonResult } from './types';

function App() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [jsonFiles, setJsonFiles] = useState<FileList | null>(null);
  const [csvColumn, setCsvColumn] = useState('File_Content');
  const [jsonKey, setJsonKey] = useState('currentUser');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!csvFile || !jsonFiles || jsonFiles.length === 0) {
      setError('Please select both CSV file and JSON files');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const csvUsers = await parseCsvFile(csvFile, csvColumn, jsonKey);

      const { matching, missing } = await parseJsonFiles(jsonFiles, csvUsers, jsonKey);

      const missingUsers = Array.from(missing.entries()).map(([user, files]) => ({
        currentUser: user,
        files,
        count: files.length,
      }));

      setResults({
        totalJsonFiles: jsonFiles.length,
        matchingUsers: matching,
        missingUsers,
        csvCount: csvUsers.size,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during processing');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCsvFile(null);
    setJsonFiles(null);
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-8 h-8 text-slate-700" />
            <h1 className="text-3xl font-bold text-slate-900">User Comparison Tool</h1>
          </div>
          <p className="text-slate-600">Compare usernames from CSV and JSON files to identify mismatches</p>
        </div>

        {!results ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FileUpload
                    label="CSV File"
                    accept=".csv"
                    onChange={(files) => setCsvFile(files?.[0] || null)}
                    selectedFiles={csvFile}
                  />
                </div>

                <div>
                  <FileUpload
                    label="JSON Files"
                    accept=".json"
                    multiple
                    onChange={(files) => setJsonFiles(files)}
                    selectedFiles={jsonFiles}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="w-5 h-5 text-slate-600" />
                  <h3 className="text-lg font-semibold text-slate-900">Configuration</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CSV Column Name
                    </label>
                    <input
                      type="text"
                      value={csvColumn}
                      onChange={(e) => setCsvColumn(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., File_Content"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JSON Key
                    </label>
                    <input
                      type="text"
                      value={jsonKey}
                      onChange={(e) => setJsonKey(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., currentUser"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleProcess}
                  disabled={isProcessing || !csvFile || !jsonFiles}
                  className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isProcessing ? 'Processing...' : 'Compare Files'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <ResultsDisplay results={results} />

            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                Start New Comparison
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
