"use client";

import { useState, useRef } from "react";
import { DownloadCloud, FileText } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { CardHeader } from "@/components/ui/card";

import { toast } from "sonner";
import { useFinancialYear } from "@/app/context/FinancialYearContext";

const TransactionHeader = ({ currentFilters = {} }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { financialYear } = useFinancialYear();
  // Create a ref for the download iframe
  const downloadIframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Show loading toast
      toast.loading("Preparing your CSV download...", {
        id: "download-toast",
        duration: 0,
        position: "top-center",
        icon: <FileText className="text-blue-500 animate-pulse" />,
        description: "We're getting your transaction data ready",
        className:
          "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800",
      });

      // Build query parameters from current filters
      const queryParams = new URLSearchParams();

      // Add current filters to query params
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
      });

      // Add format and cache-busting timestamp
      queryParams.append("format", "csv");
      queryParams.append("financialYear", financialYear);
      queryParams.append("timestamp", Date.now().toString());

      // Create download URL
      const downloadUrl = `/api/transactions/download?${queryParams.toString()}`;

      // Use iframe for download instead of fetch
      if (downloadIframeRef.current) {
        // Set the src which triggers the download
        downloadIframeRef.current.src = downloadUrl;

        // Set a timeout to show success message once download likely started
        setTimeout(() => {
          toast.success("Your CSV file is ready!", {
            id: "download-toast",
            duration: 3000,
            position: "top-center",
            icon: <FileText className="text-blue-600" />,
            description:
              "Your transaction data has been downloaded successfully",
            className:
              "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800",
          });
          setIsDownloading(false);
        }, 2000);
      } else {
        throw new Error("Download iframe not available");
      }
    } catch (error) {
      console.error("Download preparation error:", error);
      toast.error("Download failed. Please try again later.", {
        id: "download-toast",
        duration: 3000,
        position: "top-center",
        description: "There was a problem preparing your download.",
        className:
          "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800",
      });
      setIsDownloading(false);
    }
  };

  return (
    <>
      {/* Hidden iframe for downloads */}
      <iframe
        ref={downloadIframeRef}
        style={{ display: "none" }}
        title="Download Frame"
      />

      <div className="p-0 m-0 gap-0">
        <div>
          {/* <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 shadow-sm">
                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                  Transaction History
                  <Badge
                    variant="outline"
                    className="ml-2 px-2 py-0 text-xs font-normal text-indigo-500 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                  >
                    Latest
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-0.5">
                  Manage and track your financial activities with ease
                </CardDescription>
              </div>
            </div>
          </div> */}

          <div>
            {/* <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Filter
                size={16}
                className="text-slate-600 dark:text-slate-400"
              />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Bell size={16} className="text-slate-600 dark:text-slate-400" />
            </Button> */}

            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className=" rounded-lg w-fit font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 "
            >
              {isDownloading ? (
                <>
                  <DownloadCloud size={16} className="animate-bounce" />
                  Downloading CSV...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Download CSV
                </>
              )}
            </Button>
          </div>
        </div>

        {/* <div className="mt-6 hidden sm:flex items-center justify-between text-xs">
          <div className="flex items-center gap-6 bg-white dark:bg-slate-800/50 p-2.5 px-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-200 dark:shadow-none"></div>
              <span className="text-muted-foreground font-medium">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-200 dark:shadow-none"></div>
              <span className="text-muted-foreground font-medium">
                Expenses
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200 dark:shadow-none"></div>
              <span className="text-muted-foreground font-medium">
                Transfers
              </span>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default TransactionHeader;
