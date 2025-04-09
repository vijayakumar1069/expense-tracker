import { useState, useEffect, useRef } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormSectionProps } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { X, ImagePlus } from "lucide-react";
import Image from "next/image";
interface imagesProps {
  id: string;
  url: string;
  transactionId: string;
  isExisting?: boolean;
}
export const DateImageSection: React.FC<FormSectionProps> = ({
  form,
  mode,
  viewMode = false,
}) => {
  const [previewImages, setPreviewImages] = useState<
    Array<{ url: string; file?: File; isExisting?: boolean }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "edit") {
      const existingAttachments = form.getValues("attachments") || [];

      if (
        Array.isArray(existingAttachments) &&
        existingAttachments.length > 0
      ) {
        // Map attachment objects to the format expected by previewImages
        setPreviewImages(
          existingAttachments.map((attachment) => ({
            url: attachment.url,
            id: attachment.id,
            isExisting: true,
          }))
        );
      }
    }
  }, [form, mode]);

  // Handle file selection
  // Make this change to ensure files are set correctly
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const newFiles = Array.from(e.target.files);
    const newPreviews: Array<{ url: string; file: File }> = [];

    // Create preview URLs
    newFiles.forEach((file) => {
      newPreviews.push({
        url: URL.createObjectURL(file),
        file: file,
      });
    });

    // Update state with new previews
    const updatedPreviews = [...previewImages, ...newPreviews];
    setPreviewImages(updatedPreviews);

    // Update form value with ALL file objects (including newly added ones)
    const allFiles = updatedPreviews
      .filter((preview) => preview.file instanceof File)
      .map((preview) => preview.file);

    form.setValue("images", allFiles);

    // Reset input
    e.target.value = "";
  };

  // Remove an image
  const removeImage = (index: number) => {
    const imageToRemove = previewImages[index] as {
      url: string;
      file?: File;
      isExisting?: boolean;
      id?: string;
    };

    // Handle removing existing images
    if (imageToRemove.isExisting) {
      const existingAttachments = form.getValues("attachments") || [];

      // Add to deleteImages field - store the ID instead of URL
      const currentDeleteImages = form.getValues("deleteImages") || "";
      const updatedDeleteImages = currentDeleteImages
        ? `${currentDeleteImages},${imageToRemove.id}`
        : imageToRemove.id;

      form.setValue("deleteImages", updatedDeleteImages);

      // Update existingImages in form
      const updatedAttachments = existingAttachments.filter(
        (attachment: imagesProps) => attachment.id !== imageToRemove.id
      );
      form.setValue("attachments", updatedAttachments);
    }

    // Update previews
    const newPreviews = [...previewImages];

    // If it's a file URL, revoke it
    if (imageToRemove.url && imageToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);

    // Update form value with remaining files
    const remainingFiles = newPreviews
      .filter((preview) => preview.file)
      .map((preview) => preview.file);

    form.setValue("images", remainingFiles, { shouldValidate: true });
  };
  // Cleanup URLs on unmount
  // useEffect(() => {
  //   return () => {
  //     previewImages.forEach((preview) => {
  //       if (preview.url && preview.url.startsWith("blob:")) {
  //         URL.revokeObjectURL(preview.url);
  //       }
  //     });
  //   };
  // }, []);

  return (
    <div className="lg:col-span-2">
      {/* Date Input */}

      {/* Simplified Image Upload */}
      <FormField
        control={form.control}
        name="images"
        render={() => (
          <FormItem>
            <FormLabel>Images</FormLabel>
            <div className="space-y-3">
              {/* Image preview */}
              {previewImages.length > 0 && (
                <div className="flex flex-wrap w-full gap-2">
                  {previewImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative h-20 w-20 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700"
                    >
                      <Image
                        src={img.url}
                        alt={`Image ${idx + 1}`}
                        fill
                        sizes="100%"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-0 right-0 bg-black/50 rounded-bl-md hover:bg-black/70 transition-colors p-1"
                      >
                        {!viewMode && <X className="h-3 w-3 text-white" />}
                      </button>

                      {/* Small label for existing vs new */}
                      {img.isExisting && (
                        <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 text-[10px] text-white text-center py-0.5">
                          Saved
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Simple add button */}
              {previewImages.length < 5 && !viewMode && (
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="mr-1 h-4 w-4" />
                    Add Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple={previewImages.length === 0}
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <span className="ml-2 text-xs text-slate-500">
                    {previewImages.length}/5 images
                  </span>
                </div>
              )}

              {/* Hidden field for tracking deleted images */}
              <Input type="hidden" name="deleteImages" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
