// app/api/transaction/[id]/download/route.ts

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/utils/prisma";
import archiver from "archiver";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const { id } = (await params) || {};

    const transaction = await prisma.transaction.findUnique({
      where: { id: id },
      include: { attachments: true },
    });

    if (!transaction?.attachments?.length) {
      return new Response("No attachments found", { status: 404 });
    }

    // Generate a safe filename from transaction name
    const safeTransactionName = transaction.name
      .replace(/[^a-zA-Z0-9-_]/g, "_") // Replace invalid filename chars with underscore
      .replace(/_{2,}/g, "_") // Replace multiple underscores with single one
      .trim();

    // If there's only one attachment, return it directly
    if (transaction.attachments.length === 1) {
      const attachment = transaction.attachments[0];

      try {
        const response = await fetch(attachment.url);
        if (!response.ok) {
          console.error(`Failed to fetch attachment: ${attachment.url}`);
          return new Response("Failed to fetch attachment", { status: 500 });
        }

        const arrayBuffer = await response.arrayBuffer();

        // Determine content type based on URL or default to octet-stream
        let contentType = "application/octet-stream";
        const urlLower = attachment.url.toLowerCase();
        if (urlLower.endsWith(".pdf")) contentType = "application/pdf";
        else if (urlLower.endsWith(".jpg") || urlLower.endsWith(".jpeg"))
          contentType = "image/jpeg";
        else if (urlLower.endsWith(".png")) contentType = "image/png";
        else if (urlLower.endsWith(".gif")) contentType = "image/gif";
        // Add more content types as needed

        // Get file extension from original URL
        const originalExtension = attachment.url.split(".").pop() || "file";

        // Create filename using transaction name and extension
        const fileName = `${safeTransactionName}.${originalExtension}`;

        // Set headers for direct file download
        const headers = {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${fileName}"`,
        };

        return new Response(arrayBuffer, {
          status: 200,
          headers,
        });
      } catch (err) {
        console.error(`Error processing attachment: ${err}`);
        return new Response("Error processing attachment", { status: 500 });
      }
    }

    // For multiple attachments, create a zip archive
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Set compression level
    });

    // Set up error handler
    archive.on("error", (err) => {
      console.error("Archive error:", err);
      throw err;
    });

    // Set headers for zip download
    const headers = {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeTransactionName}-attachments.zip"`,
    };

    // Create array to store chunks
    const chunks: Uint8Array[] = [];

    // Collect data chunks
    archive.on("data", (chunk) => {
      chunks.push(chunk);
    });

    // When archive is finalized, create response
    const responsePromise = new Promise<Response>((resolve) => {
      archive.on("end", () => {
        const bodyInit = new Uint8Array(
          chunks.reduce((acc, chunk) => acc + chunk.length, 0)
        );

        let offset = 0;
        for (const chunk of chunks) {
          bodyInit.set(chunk, offset);
          offset += chunk.length;
        }

        resolve(
          new Response(bodyInit, {
            status: 200,
            headers,
          })
        );
      });
    });

    // Add files to zip
    for (const [index, attachment] of transaction.attachments.entries()) {
      try {
        const response = await fetch(attachment.url);
        if (!response.ok) {
          console.error(`Failed to fetch attachment: ${attachment.url}`);
          continue;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Get original file extension from URL
        const originalExtension = attachment.url.split(".").pop() || "file";

        // Create filename using transaction name and index for multiple files
        const fileName = `${safeTransactionName}_${index + 1}.${originalExtension}`;

        archive.append(buffer, { name: fileName });
      } catch (err) {
        console.error(`Error processing attachment: ${err}`);
      }
    }

    // Finalize the archive
    archive.finalize();

    return responsePromise;
  } catch (error) {
    console.error("Download error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
