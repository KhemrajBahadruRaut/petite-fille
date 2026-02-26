"use client";
import { useState, useEffect, useRef } from "react";
import { apiUrl, normalizeApiAssetUrl } from "@/utils/api";

interface AboutUsData {
  top: {
    paragraph1: string;
    paragraph2: string;
    image1?: string;
    image2?: string;
  };
  bottom: {
    paragraph1: string;
    paragraph2: string;
    image1?: string;
    image2?: string;
  };
}

interface FormData {
  top: {
    paragraph1: string;
    paragraph2: string;
    image1: File | null;
    image2: File | null;
    currentImage1?: string;
    currentImage2?: string;
  };
  bottom: {
    paragraph1: string;
    paragraph2: string;
    image1: File | null;
    image2: File | null;
    currentImage1?: string;
    currentImage2?: string;
  };
}

export default function AboutUsCMS() {
  const [formData, setFormData] = useState<FormData>({
    top: { paragraph1: "", paragraph2: "", image1: null, image2: null },
    bottom: { paragraph1: "", paragraph2: "", image1: null, image2: null }
  });

  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<"top" | "bottom">("top");
  const [previewUrls, setPreviewUrls] = useState<{
    top: { image1?: string; image2?: string };
    bottom: { image1?: string; image2?: string };
  }>({ top: {}, bottom: {} });
  const previewUrlsRef = useRef(previewUrls);

  // Fetch current data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(apiUrl("about/aboutus.php"));
        if (!res.ok) {
          throw new Error("Failed to fetch about data");
        }
        const data: AboutUsData = await res.json();
        
        setFormData({
          top: {
            paragraph1: data.top?.paragraph1 || "",
            paragraph2: data.top?.paragraph2 || "",
            image1: null,
            image2: null,
            currentImage1: data.top?.image1
              ? normalizeApiAssetUrl(data.top.image1)
              : "",
            currentImage2: data.top?.image2
              ? normalizeApiAssetUrl(data.top.image2)
              : ""
          },
          bottom: {
            paragraph1: data.bottom?.paragraph1 || "",
            paragraph2: data.bottom?.paragraph2 || "",
            image1: null,
            image2: null,
            currentImage1: data.bottom?.image1
              ? normalizeApiAssetUrl(data.bottom.image1)
              : "",
            currentImage2: data.bottom?.image2
              ? normalizeApiAssetUrl(data.bottom.image2)
              : ""
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleTextChange = (section: "top" | "bottom", field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileChange = (section: "top" | "bottom", field: string, file: File | null) => {
    if (file) {
      const previousPreview = previewUrls[section][
        field as keyof typeof previewUrls.top
      ];
      if (previousPreview) {
        URL.revokeObjectURL(previousPreview);
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: previewUrl
        }
      }));
    }

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: file
      }
    }));
  };

  useEffect(() => {
    previewUrlsRef.current = previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      Object.values(previewUrlsRef.current).forEach((section) => {
        Object.values(section).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
      });
    };
  }, []);

  const removeImage = (section: "top" | "bottom", field: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: null,
        [`currentImage${field.slice(-1)}`]: undefined
      }
    }));

    // Clean up preview URL
    if (previewUrls[section][field as keyof typeof previewUrls.top]) {
      URL.revokeObjectURL(previewUrls[section][field as keyof typeof previewUrls.top]!);
      setPreviewUrls(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: undefined
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Append all sections data at once
      Object.entries(formData).forEach(([section, sectionData]) => {
        data.append(`${section}[paragraph1]`, sectionData.paragraph1);
        data.append(`${section}[paragraph2]`, sectionData.paragraph2);
        
        if (sectionData.image1) data.append(`${section}[image1]`, sectionData.image1);
        if (sectionData.image2) data.append(`${section}[image2]`, sectionData.image2);
        
        // Add flags for removed images
        if (!sectionData.image1 && !sectionData.currentImage1) {
          data.append(`${section}[removeImage1]`, "true");
        }
        if (!sectionData.image2 && !sectionData.currentImage2) {
          data.append(`${section}[removeImage2]`, "true");
        }
      });

      const res = await fetch(apiUrl("about/aboutus_update.php"), {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      
      if (result.success) {
        alert("About Us content updated successfully!");
        // Reset file inputs after successful upload
        setFormData(prev => ({
          top: { ...prev.top, image1: null, image2: null },
          bottom: { ...prev.bottom, image1: null, image2: null }
        }));
        // Clear preview URLs
        Object.values(previewUrls).forEach(section => {
          Object.values(section).forEach(url => {
            if (url) URL.revokeObjectURL(url);
          });
        });
        setPreviewUrls({ top: {}, bottom: {} });
      } else {
        throw new Error(result.message || "Error updating data");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderTextEditor = ({
    value,
    onChange,
    placeholder
  }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  }) => (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      <div className="flex border-b border-gray-300 bg-gray-50">
        <button
          type="button"
          onClick={() => onChange(value + "<strong>Bold Text</strong>")}
          className="px-3 py-2 text-sm font-medium hover:bg-gray-200"
          title="Add Bold Text"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => onChange(value + "<em>Italic Text</em>")}
          className="px-3 py-2 text-sm font-medium hover:bg-gray-200"
          title="Add Italic Text"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => onChange(value + "<br>")}
          className="px-3 py-2 text-sm font-medium hover:bg-gray-200"
          title="Add Line Break"
        >
          ↵
        </button>
        <button
          type="button"
          onClick={() => onChange(value + "&nbsp;")}
          className="px-3 py-2 text-sm font-medium hover:bg-gray-200"
          title="Add Space"
        >
          ␣
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="w-full px-4 py-3 text-gray-900 resize-none focus:outline-none"
        placeholder={placeholder}
      />
      <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-300">
        Character count: {value.length} | Line breaks: {(value.match(/<br>/g) || []).length}
      </div>
    </div>
  );

  const renderImageUploader = ({
    section,
    field,
    currentImage
  }: {
    section: "top" | "bottom";
    field: "image1" | "image2";
    currentImage?: string;
  }) => {
    const hasImage = formData[section][field as 'image1' | 'image2'] || currentImage;
    const previewUrl = previewUrls[section][field as 'image1' | 'image2'] || currentImage;

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {field === 'image1' ? 'Primary Image' : 'Secondary Image'}
        </label>
        
        {hasImage && previewUrl ? (
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4">
            <img 
              src={previewUrl} 
              alt={`Preview`}
              className="max-h-48 mx-auto rounded"
            />
            <div className="flex justify-center mt-3 space-x-2">
              <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Replace Image
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(section, field, e.target.files?.[0] || null)}
                  accept="image/*"
                />
              </label>
              <button
                type="button"
                onClick={() => removeImage(section, field)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="mt-2">
              <label className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                Upload an image
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(section, field, e.target.files?.[0] || null)}
                  accept="image/*"
                />
              </label>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSectionTab = ({ section, label }: { section: "top" | "bottom", label: string }) => (
    <button
      type="button"
      onClick={() => setActiveSection(section)}
      className={`px-6 py-3 font-medium rounded-t-lg transition-colors ${
        activeSection === section
          ? "bg-white text-blue-600 border-t-2 border-l-2 border-r-2 border-blue-600"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  const renderSectionForm = ({ section }: { section: "top" | "bottom" }) => (
    <div className="space-y-6 p-6 bg-white border-2 border-t-0 border-gray-200 rounded-b-lg">
      {/* Paragraphs */}
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Paragraph
          </label>
          {renderTextEditor({
            value: formData[section].paragraph1,
            onChange: (value) => handleTextChange(section, "paragraph1", value),
            placeholder: "Enter the main paragraph content for this section..."
          })}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Paragraph
          </label>
          {renderTextEditor({
            value: formData[section].paragraph2,
            onChange: (value) => handleTextChange(section, "paragraph2", value),
            placeholder: "Enter additional paragraph content for this section..."
          })}
        </div>
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
        {renderImageUploader({
          section,
          field: "image1",
          currentImage: formData[section].currentImage1
        })}
        {renderImageUploader({
          section,
          field: "image2",
          currentImage: formData[section].currentImage2
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">About Us Content Editor</h2>
        <p className="text-gray-600">Edit both top and bottom sections with rich text formatting</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Tabs */}
        <div className="flex border-b border-gray-200">
          {renderSectionTab({ section: "top", label: "Top Section" })}
          {renderSectionTab({ section: "bottom", label: "Bottom Section" })}
        </div>

        {/* Active Section Form */}
        {renderSectionForm({ section: activeSection })}

        {/* Quick Actions */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>
              <p className="text-sm text-gray-500">Manage both sections efficiently</p>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    top: { ...formData.top, paragraph1: "", paragraph2: "" },
                    bottom: { ...formData.bottom, paragraph1: "", paragraph2: "" }
                  });
                }}
                className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
              >
                Clear All Text
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    top: { ...prev.top, image1: null, image2: null, currentImage1: undefined, currentImage2: undefined },
                    bottom: { ...prev.bottom, image1: null, image2: null, currentImage1: undefined, currentImage2: undefined }
                  }));
                }}
                className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
              >
                Remove All Images
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Editing: <span className="font-medium capitalize">{activeSection} Section</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving All Changes...
                
              </span>
            ) : (
              "Save All Sections"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
