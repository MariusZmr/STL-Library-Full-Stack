import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { StlFile } from "../types";
// import StlViewer from "./StlViewer"; // StlViewer is no longer used here
import axios from "axios";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton"; // Skeleton for loading state on button

interface FileCardProps {
  file: StlFile;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDownloading(true);
    try {
      const response = await axios({
        url: file.s3Url,
        method: "GET",
        responseType: "blob",
      });

      const postName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      const today = new Date().toISOString().split("T")[0];
      const filename = `${postName}_${today}.stl`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
      // You could show an error message to the user here
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Link to={`/files/${file.id}`} className="block">
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        {/* Display thumbnail image instead of StlViewer */}
        <div className="relative h-[140px] w-full overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {file.thumbnailS3Url ? (
            <img
              src={file.thumbnailS3Url}
              alt={`Thumbnail for ${file.name}`}
              className="object-cover h-full w-full"
            />
          ) : (
            <span className="text-muted-foreground text-sm">No Thumbnail</span>
          )}
        </div>

        <CardContent className="flex-grow p-4">
          <h3 className="text-lg font-semibold mb-1">{file.name}</h3>
          <p className="text-sm text-muted-foreground">{file.description}</p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full"
          >
            {isDownloading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              "Download"
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default FileCard;
