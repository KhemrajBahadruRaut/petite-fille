"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiUrl, normalizeApiAssetUrl } from "@/utils/api";

interface Image {
  id: number;
  image_url: string;
  section: number;
}

type SectionData = {
  [key: number]: Image[];
};

export default function AdminGalleryPage() {
  const [sections, setSections] = useState<SectionData>({});
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [section, setSection] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  const API_URL = apiUrl("gallery/gallery.php");
  const UPLOAD_URL = apiUrl("gallery/upload.php");

  const sectionConfig = {
    1: {
      name: "Portfolio",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: "bg-rose-50 border-rose-200 text-rose-700",
      activeColor: "bg-rose-100 border-rose-300 text-rose-800 shadow-lg transform scale-[1.02]",
      hoverColor: "hover:bg-rose-100 hover:border-rose-300 hover:shadow-md hover:scale-[1.01]"
    },
    2: {
      name: "Showcase",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-emerald-50 border-emerald-200 text-emerald-700",
      activeColor: "bg-emerald-100 border-emerald-300 text-emerald-800 shadow-lg transform scale-[1.02]",
      hoverColor: "hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md hover:scale-[1.01]"
    },
    3: {
      name: "Gallery",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.084 15.812a7.5 7.5 0 010-7.624M19.043 17.771a10.5 10.5 0 010-11.542M9.25 8.5l3 3m0 0l3-3m-3 3V3m-3.5 9.5h7" />
        </svg>
      ),
      color: "bg-amber-50 border-amber-200 text-amber-700",
      activeColor: "bg-amber-100 border-amber-300 text-amber-800 shadow-lg transform scale-[1.02]",
      hoverColor: "hover:bg-amber-100 hover:border-amber-300 hover:shadow-md hover:scale-[1.01]"
    }
  };

  const getImageUrl = useCallback((imagePath: string) => {
    if (imagePath.startsWith("http")) return normalizeApiAssetUrl(imagePath);
    const cleanPath = imagePath.replace(/^[./]+/, "");
    return apiUrl(`gallery/${cleanPath}`);
  }, []);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const normalizedSections: SectionData = {};

      Object.entries(data || {}).forEach(([sectionKey, images]) => {
        normalizedSections[Number(sectionKey)] = (images as Image[]).map(
          (image) => ({
            ...image,
            image_url: getImageUrl(image.image_url),
          }),
        );
      });

      setSections(normalizedSections);
    } catch (error) {
      console.error("Error fetching images:", error);
      setSections({ 1: [], 2: [], 3: [] });
    }
  }, [API_URL, getImageUrl]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== selectedFiles.length) {
      alert('Some files were skipped. Please select only image files.');
    }
    
    if (imageFiles.length > 0) {
      setFiles(prev => [...prev, ...imageFiles]);
      setImageErrors({});
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== droppedFiles.length) {
      alert('Some files were skipped. Please drop only image files.');
    }
    
    if (imageFiles.length > 0) {
      setFiles(prev => [...prev, ...imageFiles]);
      setImageErrors({});
    }
  };

  const handleImageError = (imageId: number) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  const uploadImages = async () => {
    if (files.length === 0) {
      alert('Please select at least one image');
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`${oversizedFiles.length} file(s) exceed 5MB limit and will be skipped`);
      const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
      setFiles(validFiles);
      if (validFiles.length === 0) return;
    }

    setIsUploading(true);
    setUploadProgress({});
    let successCount = 0;
    let errorCount = 0;

    try {
      // Upload files one by one to show individual progress
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileKey = `${file.name}-${i}`;
        
        try {
          setUploadProgress(prev => ({ ...prev, [fileKey]: 0 }));
          
          const formData = new FormData();
          formData.append("image", file);
          formData.append("section", section.toString());

          const res = await fetch(UPLOAD_URL, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`Upload failed with status: ${res.status}`);
          }

          const result = await res.json();
          
          if (result.success) {
            setUploadProgress(prev => ({ ...prev, [fileKey]: 100 }));
            successCount++;
          } else {
            throw new Error(result.message || 'Upload failed');
          }
        } catch (error) {
          console.error(`Upload error for ${file.name}:`, error);
          errorCount++;
          setUploadProgress(prev => ({ ...prev, [fileKey]: -1 })); // -1 indicates error
        }
      }

      // Show results
      if (successCount > 0) {
        await fetchImages(); // Refresh the images list
        alert(`Successfully uploaded ${successCount} image(s)!${errorCount > 0 ? ` ${errorCount} failed.` : ''}`);
      }
      
      if (errorCount === files.length) {
        alert('All uploads failed. Please check the console and ensure the server is running.');
      }

      // Clear selected files after upload to release memory from previews and file buffers.
      setFiles([]);
      setImageErrors({});

    } catch (error) {
      console.error('Upload process error:', error);
      alert('Upload process failed. Please try again.');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress({}), 3000); // Clear progress after 3 seconds
    }
  };

  const deleteImage = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`${API_URL}?id=${id}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) throw new Error('Delete failed');
      
      await fetchImages();
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const clearSelection = () => {
    setFiles([]);
    setUploadProgress({});
    setImageErrors({});
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          
          <h1 className="text-xl font-semibold text-slate-800 mb-2">
            Gallery Management
          </h1>
          <p className="text-slate-600">Organize and manage your gallery collections with ease</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Upload New Image</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragOver 
                  ? 'border-blue-400 bg-blue-50' 
                  : files.length > 0
                    ? 'border-green-400 bg-green-50'
                    : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {files.length > 0 ? (
                <div className="space-y-4">
                  <div className="max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {files.slice(0, 4).map((file, index) => {
                        const fileKey = `${file.name}-${index}`;
                        const progress = uploadProgress[fileKey];
                        return (
                          <div key={index} className="relative">
                            <img
                              src={previewUrls[index]}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg shadow-sm"
                            />
                            {progress !== undefined && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                {progress === -1 ? (
                                  <span className="text-red-400 text-xs">Failed</span>
                                ) : progress === 100 ? (
                                  <span className="text-green-400 text-xs">✓ Done</span>
                                ) : (
                                  <span className="text-white text-xs">{progress}%</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {files.length > 4 && (
                      <div className="mt-2 text-sm text-slate-600">
                        +{files.length - 4} more files
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{files.length} image{files.length !== 1 ? 's' : ''} selected</span>
                  </div>
                  <button
                    onClick={clearSelection}
                    className="text-slate-500 hover:text-slate-700 text-sm font-medium underline"
                  >
                    Clear all files
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium text-lg">Drop multiple images here</p>
                    <p className="text-slate-500 text-sm mt-1">or click to browse and select multiple files</p>
                    <p className="text-slate-400 text-xs mt-2">Supports: JPG, PNG, GIF • Max: 5MB each</p>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 hover:border-slate-400 cursor-pointer transition-colors font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Browse Files
                  </label>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Select Section
                </label>
                <div className="space-y-3">
                  {[1, 2, 3].map((sec) => {
                    const config = sectionConfig[sec as keyof typeof sectionConfig];
                    const isSelected = section === sec;
                    return (
                      <button
                        key={sec}
                        onClick={() => setSection(sec)}
                        className={`w-full flex items-center p-2 rounded-lg border-2 transition-all duration-200 ${
                          isSelected ? config.activeColor : config.color
                        } hover:shadow-sm`}
                      >
                        <span className="text-2xl mr-3">{config.icon}</span>
                        <div className="text-left flex-1">
                          <div className="font-semibold">Section {sec}</div>
                          <div className="text-sm opacity-75">{config.name}</div>
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={uploadImages}
                  disabled={isUploading || files.length === 0}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
                    isUploading || files.length === 0
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Uploading {files.length} image{files.length !== 1 ? 's' : ''}...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload {files.length > 0 ? `${files.length} Image${files.length !== 1 ? 's' : ''}` : 'Images'}
                    </>
                  )}
                </button>
                
                {files.length > 0 && (
                  <>
                    <div className="bg-slate-50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-sm text-slate-600">
                          <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">{files.length} files selected</span>
                        </div>
                        <button
                          onClick={clearSelection}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                          disabled={isUploading}
                        >
                          Clear All
                        </button>
                      </div>
                      
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {files.map((file, index) => {
                          const fileKey = `${file.name}-${index}`;
                          const progress = uploadProgress[fileKey];
                          return (
                            <div key={index} className="flex items-center justify-between text-xs text-slate-600 bg-white rounded p-2">
                              <div className="flex-1 min-w-0">
                                <span className="truncate font-medium">{file.name}</span>
                                <div className="text-slate-400">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                              </div>
                              <div className="flex items-center ml-2">
                                {progress !== undefined && (
                                  <div className="mr-2">
                                    {progress === -1 ? (
                                      <span className="text-red-500">Failed</span>
                                    ) : progress === 100 ? (
                                      <span className="text-green-500">✓ Done</span>
                                    ) : (
                                      <span className="text-blue-500">{progress}%</span>
                                    )}
                                  </div>
                                )}
                                {!isUploading && (
                                  <button
                                    onClick={() => removeFile(index)}
                                    className="text-red-400 hover:text-red-600"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-200">
                        Destination: Section {section} • Total size: {(files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Sections */}
        <div className="space-y-6">
          {[1, 2, 3].map((sec) => {
            const config = sectionConfig[sec as keyof typeof sectionConfig];
            return (
              <div key={sec} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center mr-4 transition-all duration-300 hover:shadow-md`}>
                      {config.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">
                        Section {sec} - {config.name}
                      </h3>
                      <p className="text-slate-500 text-sm">
                        {sections[sec]?.length || 0} {(sections[sec]?.length || 0) === 1 ? 'image' : 'images'}
                      </p>
                    </div>
                  </div>
                </div>

                {sections[sec]?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {sections[sec].map((img) => (
                      <div
                        key={img.id}
                        className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 hover:shadow-md transition-all duration-200"
                      >
                        {imageErrors[img.id] ? (
                          <div className="w-full h-32 bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-center">Image not found</span>
                          </div>
                        ) : (
                          <img
                            src={img.image_url}
                            alt={`Section ${sec} image ${img.id}`}
                            className="w-full h-32 object-cover"
                            onError={() => handleImageError(img.id)}
                            loading="lazy"
                          />
                        )}
                        
                        <div className="absolute inset-0  group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                          <button
                            onClick={() => deleteImage(img.id)}
                            disabled={isDeleting === img.id}
                            className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-200 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg disabled:opacity-50"
                            title="Delete image"
                          >
                            {isDeleting === img.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">No images in this section</p>
                    <p className="text-slate-400 text-sm mt-1">Upload your first image to get started</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Debug Info */}
        {/* <div className="mt-8 bg-slate-100 rounded-lg border border-slate-200">
          <details className="p-4">
            <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900 select-none">
              Debug Information
            </summary>
            <pre className="text-xs mt-3 text-slate-600 bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(sections, null, 2)}
            </pre>
          </details>
        </div> */}
      </div>
    </div>
  );
}
