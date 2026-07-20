"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  apiUrl,
  normalizeApiAssetUrl,
  withCacheVersion,
} from "../../../utils/api";
import { optimizeImageUpload } from "../../../utils/optimizeImageUpload";

type SectionName = "top" | "bottom";
type ImageField = "image1" | "image2";

const MAX_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_IMAGE_BYTES = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

interface SectionFormData {
  paragraph1: string;
  paragraph2: string;
  image1: File | null;
  image2: File | null;
  currentImage1?: string;
  currentImage2?: string;
}

interface FormData {
  top: SectionFormData;
  bottom: SectionFormData;
}

interface RemovalTarget {
  section: SectionName;
  field: ImageField;
}

export default function AboutUsCMS() {
  const [formData, setFormData] = useState<FormData>({
    top: { paragraph1: "", paragraph2: "", image1: null, image2: null },
    bottom: { paragraph1: "", paragraph2: "", image1: null, image2: null }
  });

  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionName>("top");
  const [optimizingImages, setOptimizingImages] = useState<Record<string, boolean>>({});
  const [removingImages, setRemovingImages] = useState<Record<string, boolean>>({});
  const [optimizationNotes, setOptimizationNotes] = useState<Record<string, string>>({});
  const [previewUrls, setPreviewUrls] = useState<{
    top: { image1?: string; image2?: string };
    bottom: { image1?: string; image2?: string };
  }>({ top: {}, bottom: {} });
  const previewUrlsRef = useRef(previewUrls);
  const persistedContentRef = useRef<AboutUsData | null>(null);

  const requestAboutData = useCallback(async () => {
    const version = Date.now();
    const res = await fetch(
      withCacheVersion(apiUrl("about/aboutus.php"), version),
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error("Failed to fetch about data");

    const data: AboutUsData = await res.json();
    return { data, version };
  }, []);

  const fetchData = useCallback(async () => {
    const { data, version } = await requestAboutData();
    const imageUrl = (path?: string) =>
      path
        ? withCacheVersion(normalizeApiAssetUrl(path), version)
        : "";

    persistedContentRef.current = data;
    setFormData({
      top: {
        paragraph1: data.top?.paragraph1 || "",
        paragraph2: data.top?.paragraph2 || "",
        image1: null,
        image2: null,
        currentImage1: imageUrl(data.top?.image1),
        currentImage2: imageUrl(data.top?.image2),
      },
      bottom: {
        paragraph1: data.bottom?.paragraph1 || "",
        paragraph2: data.bottom?.paragraph2 || "",
        image1: null,
        image2: null,
        currentImage1: imageUrl(data.bottom?.image1),
        currentImage2: imageUrl(data.bottom?.image2),
      },
    });
  }, [requestAboutData]);

  // Fetch current data without allowing an old API response or image to be reused.
  useEffect(() => {
    fetchData().catch((error) => console.error("Error fetching data:", error));
  }, [fetchData]);

  const handleTextChange = (section: SectionName, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileChange = async (
    section: SectionName,
    field: ImageField,
    file: File | null,
  ) => {
    if (!file) return;

    const imageKey = `${section}.${field}`;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    if (file.size > MAX_SOURCE_IMAGE_BYTES) {
      alert("Please choose an image smaller than 25 MB.");
      return;
    }

    setOptimizingImages((previous) => ({ ...previous, [imageKey]: true }));
    setOptimizationNotes((previous) => ({
      ...previous,
      [imageKey]: "Optimizing image before upload...",
    }));

    try {
      const result = await optimizeImageUpload(file);
      if (result.file.size > MAX_UPLOAD_IMAGE_BYTES) {
        alert(
          "This image is still larger than 10 MB after optimization. Please resize or export it as WebP/JPEG first.",
        );
        setOptimizationNotes((previous) => ({
          ...previous,
          [imageKey]: "Image was not selected because it exceeds 10 MB.",
        }));
        return;
      }

      const previousPreview = previewUrls[section][field];
      if (previousPreview) URL.revokeObjectURL(previousPreview);

      const previewUrl = URL.createObjectURL(result.file);
      setPreviewUrls((previous) => ({
        ...previous,
        [section]: { ...previous[section], [field]: previewUrl },
      }));
      setFormData((previous) => ({
        ...previous,
        [section]: { ...previous[section], [field]: result.file },
      }));
      setOptimizationNotes((previous) => ({
        ...previous,
        [imageKey]: result.optimized
          ? `Optimized from ${formatFileSize(result.originalSize)} to ${formatFileSize(result.file.size)}.`
          : `${formatFileSize(result.file.size)}. ${result.reason || "Using the original image."}`,
      }));
    } catch (error) {
      console.error("Image optimization error:", error);
      alert("This image could not be prepared. Please try another file.");
    } finally {
      setOptimizingImages((previous) => ({ ...previous, [imageKey]: false }));
    }
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

  const clearImagesLocally = (targets: RemovalTarget[]) => {
    setFormData((previous) => {
      const next: FormData = {
        top: { ...previous.top },
        bottom: { ...previous.bottom },
      };

      targets.forEach(({ section, field }) => {
        const currentField = field === "image1" ? "currentImage1" : "currentImage2";
        next[section][field] = null;
        next[section][currentField] = undefined;
      });

      return next;
    });

    setPreviewUrls((previous) => {
      const next = {
        top: { ...previous.top },
        bottom: { ...previous.bottom },
      };

      targets.forEach(({ section, field }) => {
        const previewUrl = next[section][field];
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        delete next[section][field];
      });

      return next;
    });

    setOptimizationNotes((previous) => {
      const next = { ...previous };
      targets.forEach(({ section, field }) => {
        delete next[`${section}.${field}`];
      });
      return next;
    });
  };

  const removeImages = async (targets: RemovalTarget[]) => {
    const targetsWithImages = targets.filter(({ section, field }) => {
      const currentField = field === "image1" ? "currentImage1" : "currentImage2";
      return Boolean(formData[section][field] || formData[section][currentField]);
    });
    if (targetsWithImages.length === 0) {
      alert("There are no images to remove.");
      return;
    }

    const confirmationMessage = targetsWithImages.length === 1
      ? "Are you sure you want to permanently remove this image?"
      : `Are you sure you want to permanently remove these ${targetsWithImages.length} images?`;
    if (!window.confirm(confirmationMessage)) return;

    const persistedTargets = targetsWithImages.filter(({ section, field }) => {
      const currentField = field === "image1" ? "currentImage1" : "currentImage2";
      return Boolean(formData[section][currentField]);
    });

    // A newly selected image has not reached the server yet, so removing it
    // only needs to clear its local file and preview.
    if (persistedTargets.length === 0) {
      clearImagesLocally(targetsWithImages);
      return;
    }

    const removalKeys = persistedTargets.map(({ section, field }) => `${section}.${field}`);
    setRemovingImages((previous) => {
      const next = { ...previous };
      removalKeys.forEach((key) => { next[key] = true; });
      return next;
    });

    try {
      const data = new FormData();
      (["top", "bottom"] as const).forEach((section) => {
        const savedSection = persistedContentRef.current?.[section];
        data.append(
          `${section}[paragraph1]`,
          savedSection?.paragraph1 ?? formData[section].paragraph1,
        );
        data.append(
          `${section}[paragraph2]`,
          savedSection?.paragraph2 ?? formData[section].paragraph2,
        );
      });
      persistedTargets.forEach(({ section, field }) => {
        const removeField = field === "image1" ? "removeImage1" : "removeImage2";
        data.append(`${section}[${removeField}]`, "true");
      });

      const response = await fetch(apiUrl("about/aboutus_update.php"), {
        method: "POST",
        body: data,
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Removal failed with status ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || result.error || "The server rejected the removal");
      }

      // Do not trust a generic success response: reload the record and confirm
      // that every requested database image path was actually cleared.
      const { data: latestContent } = await requestAboutData();
      const removalFailed = persistedTargets.some(
        ({ section, field }) => Boolean(latestContent[section]?.[field]),
      );
      if (removalFailed) {
        throw new Error("The server did not clear the requested image field");
      }

      persistedContentRef.current = latestContent;
      clearImagesLocally(targetsWithImages);
      alert(
        targetsWithImages.length === 1
          ? "Image removed successfully."
          : "Images removed successfully.",
      );
    } catch (error) {
      console.error("Image removal error:", error);
      alert("The image could not be removed. No changes were made; please try again.");
    } finally {
      setRemovingImages((previous) => {
        const next = { ...previous };
        removalKeys.forEach((key) => { next[key] = false; });
        return next;
      });
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
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Update failed with status ${res.status}`);
      }
      const result = await res.json();
      
      if (result.success) {
        // Clear preview URLs
        Object.values(previewUrls).forEach(section => {
          Object.values(section).forEach(url => {
            if (url) URL.revokeObjectURL(url);
          });
        });
        setPreviewUrls({ top: {}, bottom: {} });
        setOptimizationNotes({});

        // Read the saved paths again and attach a fresh version to every image
        // URL. This makes both the preview and the public page bypass stale
        // browser/CDN entries immediately after a replacement.
        try {
          await fetchData();
          alert("About Us content updated successfully!");
        } catch (refreshError) {
          console.error("Saved, but failed to refresh About data:", refreshError);
          alert("Content was saved. Refresh this page to reload the latest preview.");
        }
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
    section: SectionName;
    field: ImageField;
    currentImage?: string;
  }) => {
    const hasImage = formData[section][field as 'image1' | 'image2'] || currentImage;
    const previewUrl = previewUrls[section][field as 'image1' | 'image2'] || currentImage;
    const imageKey = `${section}.${field}`;
    const isOptimizing = Boolean(optimizingImages[imageKey]);
    const isRemoving = Boolean(removingImages[imageKey]);

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
              decoding="async"
              className="max-h-48 mx-auto rounded"
            />
            <div className="flex justify-center mt-3 space-x-2">
              <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Replace Image
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    event.target.value = "";
                    void handleFileChange(section, field, file);
                  }}
                  accept="image/*"
                  disabled={isOptimizing || isRemoving}
                />
              </label>
              <button
                type="button"
                onClick={() => void removeImages([{ section, field }])}
                disabled={isOptimizing || isRemoving}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                {isRemoving ? "Removing..." : "Remove"}
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
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    event.target.value = "";
                    void handleFileChange(section, field, file);
                  }}
                  accept="image/*"
                  disabled={isOptimizing || isRemoving}
                />
              </label>
              <p className="text-xs text-gray-500">Images up to 25 MB; final upload must be 10 MB or less</p>
              <p className="text-xs text-gray-500">JPEG, PNG and WebP are optimized automatically.</p>
            </div>
          </div>
        )}
        {(isOptimizing || optimizationNotes[imageKey]) && (
          <p
            className={`text-xs ${isOptimizing ? "text-blue-600" : "text-gray-600"}`}
            role="status"
          >
            {isOptimizing
              ? "Optimizing image before upload..."
              : optimizationNotes[imageKey]}
          </p>
        )}
      </div>
    );
  };

  const renderSectionTab = ({ section, label }: { section: SectionName, label: string }) => (
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

  const renderSectionForm = ({ section }: { section: SectionName }) => (
    <div className="space-y-6 rounded-b-lg border-2 border-t-0 border-gray-200 bg-white p-4 sm:p-6">
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
    <div className="mx-auto max-w-6xl bg-white p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">About Us Content Editor</h2>
        <p className="text-gray-600">Edit both top and bottom sections with rich text formatting</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Tabs */}
        <div className="flex flex-wrap border-b border-gray-200">
          {renderSectionTab({ section: "top", label: "Top Section" })}
          {renderSectionTab({ section: "bottom", label: "Bottom Section" })}
        </div>

        {/* Active Section Form */}
        {renderSectionForm({ section: activeSection })}

        {/* Quick Actions */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>
              <p className="text-sm text-gray-500">Manage both sections efficiently</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:space-x-0">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    top: { ...formData.top, paragraph1: "", paragraph2: "" },
                    bottom: { ...formData.bottom, paragraph1: "", paragraph2: "" }
                  });
                }}
                className="w-full rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 sm:w-auto"
              >
                Clear All Text
              </button>
              <button
                type="button"
                onClick={() => void removeImages([
                  { section: "top", field: "image1" },
                  { section: "top", field: "image2" },
                  { section: "bottom", field: "image1" },
                  { section: "bottom", field: "image2" },
                ])}
                disabled={Object.values(removingImages).some(Boolean)}
                className="w-full rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 sm:w-auto"
              >
                {Object.values(removingImages).some(Boolean)
                  ? "Removing Images..."
                  : "Remove All Images"}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6">
          <div className="text-sm text-gray-500">
            Editing: <span className="font-medium capitalize">{activeSection} Section</span>
          </div>
          <button
            type="submit"
            disabled={
              loading ||
              Object.values(optimizingImages).some(Boolean) ||
              Object.values(removingImages).some(Boolean)
            }
            className="w-full rounded-md bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving All Changes...
                
              </span>
            ) : Object.values(optimizingImages).some(Boolean) ? (
              "Optimizing Images..."
            ) : (
              "Save All Sections"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
