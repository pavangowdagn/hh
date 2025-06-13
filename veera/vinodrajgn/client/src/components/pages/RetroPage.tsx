import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Eye, Loader, X, AlertCircle } from 'lucide-react';
import { Vehicle, FileUpload } from '../../types';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface RetroPageProps {
  vehicles: Vehicle[];
}

export const RetroPage: React.FC<RetroPageProps> = ({ vehicles }) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewingFile, setViewingFile] = useState<FileUpload | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFilesByType('retro');
      setFiles(data);
    } catch (error) {
      console.error('Error loading Retro files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (user?.role === 'viewer') {
      alert('Viewers cannot upload files.');
      return;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxFileSize) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const uploadedFile = await apiService.uploadFile({
          name: file.name,
          content: content.split(',')[1], // Remove data:mime;base64, prefix
          chassis: 'GENERAL', // General retro files not tied to specific vehicle
          type: 'retro'
        });
        
        if (uploadedFile) {
          await loadFiles();
          event.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const isViewableFile = (fileName: string): boolean => {
    const ext = fileName.toLowerCase().split('.').pop();
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  const handleViewFile = (file: FileUpload) => {
    if (isViewableFile(file.name)) {
      setViewingFile(file);
    } else {
      alert('Cannot view this file type. Only PDF and image files can be viewed.');
    }
  };

  const downloadFile = (file: FileUpload) => {
    try {
      const byteCharacters = atob(file.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray]);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file.');
    }
  };

  const renderFileViewer = () => {
    if (!viewingFile) return null;

    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
      viewingFile.name.toLowerCase().split('.').pop() || ''
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{viewingFile.name}</h3>
            <button
              onClick={() => setViewingFile(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="text-center">
            {isImage ? (
              <img
                src={`data:image/${viewingFile.name.split('.').pop()};base64,${viewingFile.content}`}
                alt={viewingFile.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <iframe
                src={`data:application/pdf;base64,${viewingFile.content}`}
                className="w-full h-[70vh]"
                title={viewingFile.name}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading Retro files...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Retro Summary Files</h2>
        <p className="text-gray-600">Upload and manage retrospective summary documents</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* File Upload Section */}
        {(user?.role === 'admin' || user?.role === 'upload') && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-dashed border-purple-300">
            <div className="text-center">
              <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Retro Files</h3>
              <p className="text-gray-600 mb-4">
                Upload retrospective summary documents (PDF, images, etc.)
              </p>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                />
                <span className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
                  {uploading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Choose File
                    </>
                  )}
                </span>
              </label>
              
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT (Max 5MB)
              </p>
            </div>
          </div>
        )}

        {/* Files List */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Uploaded Files ({files.length})
          </h3>
          
          {files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No Retro files uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div key={file.id} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-8 w-8 text-purple-500 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                      
                      <div className="flex items-center space-x-2 mt-3">
                        {isViewableFile(file.name) ? (
                          <button
                            onClick={() => handleViewFile(file)}
                            className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                        ) : (
                          <div className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-md">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Cannot View
                          </div>
                        )}
                        
                        <button
                          onClick={() => downloadFile(file)}
                          className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {renderFileViewer()}
    </div>
  );
};