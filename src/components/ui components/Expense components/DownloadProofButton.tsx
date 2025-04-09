"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";

const DownloadProofButton = ({ id }: { id?: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    const controller = new AbortController();
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/transactions/attachments-download/${id}`,
        {
          method: "GET",
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to download (${response.status})`);
      }

      // Get filename from headers
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ||
        `transaction-${id}-attachments.zip`;

      // Create blob from response stream
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="inline-block relative">
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        className="bg-green-800 hover:bg-green-700 text-white flex items-center gap-2 transition-colors duration-300 shadow-md"
        variant="default"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Download Proof
      </Button>
    </div>
  );
};

export default DownloadProofButton;
