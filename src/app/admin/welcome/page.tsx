"use client";

import { apiUrl } from "@/utils/api";
import { toast } from "@/hooks/use-toast";
import React, { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WelcomeContent {
  heading: string;
  subheading: string;
  opening_hours: string;
  paragraph_one: string;
  paragraph_two: string;
  image_left: string;
  image_right: string;
}

const FALLBACK: WelcomeContent = {
  heading: "Welcome to Petite Fille",
  subheading: "The Freshest and Cutest Cafe in Rosanna, Melbourne",
  opening_hours: "Weekdays 7:30 AM – 3 PM | Sat & Sun 8 AM – 3 PM",
  paragraph_one:
    "Welcome to Petite Fille, proudly based in Rosanna. We created Petite Fille to be a café that feels thoughtful without being overcomplicated. A place where quality speaks for itself — in the coffee, on the plate, and in the way you're looked after from the moment you walk in. Our approach is simple: well-made coffee, carefully prepared food, and service that's consistent and genuine.",
  paragraph_two:
    "We focus on the details that matter — balanced flavours, fresh ingredients, and drinks made properly every time. Whether you're stopping in for your morning takeaway, meeting friends for brunch, sitting down for a relaxed lunch, or squeezing in a quick business catch-up, our space is designed to move with your day. Being part of Rosanna means everything to us. Petite Fille isn't about trends. It's about creating a place you choose to return to. We look forward to welcoming you in.",
  image_left: "",
  image_right: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

const WelcomeEditor = () => {
  const [form, setForm]         = useState<WelcomeContent>(FALLBACK);
  const [original, setOriginal] = useState<WelcomeContent>(FALLBACK);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  // Image file state
  const [previewLeft, setPreviewLeft]   = useState<string | null>(null);
  const [previewRight, setPreviewRight] = useState<string | null>(null);
  const [fileLeft, setFileLeft]         = useState<File | null>(null);
  const [fileRight, setFileRight]       = useState<File | null>(null);

  const inputLeftRef  = useRef<HTMLInputElement>(null);
  const inputRightRef = useRef<HTMLInputElement>(null);

  // ─── Fetch current content on mount ─────────────────────────────────────
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(apiUrl("welcome/welcome.php"));
        if (!res.ok) throw new Error("Failed to load welcome content");
        const data: WelcomeContent = await res.json();
        setForm(data);
        setOriginal(data);
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to load",
          description: "Could not load welcome content. Showing default values.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (
    side: "left" | "right",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (side === "left") { setFileLeft(file); setPreviewLeft(preview); }
    else                 { setFileRight(file); setPreviewRight(preview); }
  };

  const handleReset = () => {
    setForm(original);
    setFileLeft(null);
    setFileRight(null);
    setPreviewLeft(null);
    setPreviewRight(null);
    if (inputLeftRef.current)  inputLeftRef.current.value  = "";
    if (inputRightRef.current) inputRightRef.current.value = "";
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Always use FormData so we can attach files alongside text
      const fd = new FormData();
      fd.append("heading",       form.heading);
      fd.append("subheading",    form.subheading);
      fd.append("opening_hours", form.opening_hours);
      fd.append("paragraph_one", form.paragraph_one);
      fd.append("paragraph_two", form.paragraph_two);
      if (fileLeft)  fd.append("image_left",  fileLeft);
      if (fileRight) fd.append("image_right", fileRight);

      const res = await fetch(apiUrl("welcome/welcome.php"), {
        method: "POST",
        body: fd,
        // Do NOT set Content-Type — browser sets it with the correct boundary
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      // Update local state from the response so previews sync with DB paths
      setForm(data.data);
      setOriginal(data.data);
      setFileLeft(null);
      setFileRight(null);
      setPreviewLeft(null);
      setPreviewRight(null);

      toast({
        title: "Changes saved",
        description: "Welcome section has been updated successfully.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(original) ||
    fileLeft !== null ||
    fileRight !== null;

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome Section</h1>
          <p className="text-sm text-gray-500 mt-1">Edit the text and images shown in the Welcome section.</p>
        </div>
        <div className="space-y-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-9 w-full bg-gray-100 rounded-lg" />
            </div>
          ))}
          <hr className="border-gray-100" />
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
              <div className="h-28 w-full bg-gray-100 rounded-lg" />
            </div>
          ))}
          <hr className="border-gray-100" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                <div className="h-40 w-full bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome Section</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit the text and images shown in the Welcome section of the homepage.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <Field
          label="Heading"
          name="heading"
          value={form.heading}
          onChange={handleChange}
          hint='Shown as the smaller title — e.g. "Welcome to Petite Fille"'
        />
        <Field
          label="Subheading"
          name="subheading"
          value={form.subheading}
          onChange={handleChange}
          hint="Displayed below the heading in larger text"
        />
        <Field
          label="Opening Hours"
          name="opening_hours"
          value={form.opening_hours}
          onChange={handleChange}
          hint='E.g. "Weekdays 7:30 AM – 3 PM | Sat & Sun 8 AM – 3 PM"'
        />

        <hr className="border-gray-100" />

        <TextareaField
          label="First Paragraph"
          name="paragraph_one"
          value={form.paragraph_one}
          onChange={handleChange}
          rows={5}
        />
        <TextareaField
          label="Second Paragraph"
          name="paragraph_two"
          value={form.paragraph_two}
          onChange={handleChange}
          rows={5}
        />

        <hr className="border-gray-100" />

        {/* Images */}
        <div className="grid grid-cols-2 gap-6">
          <ImageField
            label="Left Image"
            currentUrl={form.image_left}
            preview={previewLeft}
            inputRef={inputLeftRef}
            onChange={(e) => handleImageChange("left", e)}
          />
          <ImageField
            label="Right Image"
            currentUrl={form.image_right}
            preview={previewRight}
            inputRef={inputRightRef}
            onChange={(e) => handleImageChange("right", e)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3 justify-end">
        <button
          onClick={handleReset}
          disabled={!isDirty || saving}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600
                     hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="px-5 py-2 text-sm rounded-lg bg-[#E6CFAF] text-gray-800 font-medium
                     hover:bg-[#d9bb95] disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hint?: string;
}

const Field = ({ label, name, value, onChange, hint }: FieldProps) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      id={name} name={name} type="text" value={value} onChange={onChange}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-[#E6CFAF] focus:border-transparent
                 text-gray-800 placeholder-gray-400"
    />
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

interface TextareaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

const TextareaField = ({ label, name, value, onChange, rows = 4 }: TextareaFieldProps) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      id={name} name={name} rows={rows} value={value} onChange={onChange}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-y
                 focus:outline-none focus:ring-2 focus:ring-[#E6CFAF] focus:border-transparent
                 text-gray-800 placeholder-gray-400"
    />
  </div>
);

interface ImageFieldProps {
  label: string;
  currentUrl: string;
  preview: string | null;
inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageField = ({ label, currentUrl, preview, inputRef, onChange }: ImageFieldProps) => {
const displaySrc = preview ?? (currentUrl ? apiUrl(currentUrl) : null);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {/* Preview */}
      <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 mb-2">
        {displaySrc ? (
          <img src={displaySrc} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300 text-sm">
            No image
          </div>
        )}
        {preview && (
          <span className="absolute top-2 left-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">
            Unsaved
          </span>
        )}
      </div>

      {/* Upload button */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-600
                   hover:bg-gray-50 transition-colors text-center"
      >
        Choose Image
      </button>
    </div>
  );
};

export default WelcomeEditor;