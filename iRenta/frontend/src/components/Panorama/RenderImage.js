import React, { useState, useEffect } from "react";
import { Pannellum } from "pannellum-react";

// Utility function to check if an image is panoramic using blob
const isPanoramicImage = async (blob) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(img.width / img.height >= 2.0);
    };
    img.src = URL.createObjectURL(blob);
  });
};
const API_KEY = process.env.REACT_APP_GOOGLE_DRIVE_API_KEY;
// Utility function to build Google Drive direct link
const getDriveDirectLink = (id) =>
  `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${API_KEY}`;

// Fetch image as Blob
const fetchImageAsBlob = async (url) => {
  try {
    console.log("Attempting to fetch URL:", url);
    const response = await fetch(url);
    console.log("Fetch response status:", response.status);
    if (!response.ok) {
      console.error("Fetch failed:", response.statusText);
      return null;
    }
    const blob = await response.blob();
    console.log("Blob fetched successfully:", blob);
    return blob;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

const RenderImage = ({ propertyImages, darkMode }) => {
  const [images, setImages] = useState([]);
  const [panoImage, setPanoImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // Process images
  useEffect(() => {
    setIsLoading(true);
    const processImages = async () => {
      try {
        const processed = await Promise.all(
          propertyImages.map(async (image) => {
            const driveLink = await getDriveDirectLink(image.id);
            const blob = await fetchImageAsBlob(driveLink);
            if (!blob) return { ...image, isPanoramic: false };

            const isPano = await isPanoramicImage(blob);
            const objectUrl = URL.createObjectURL(blob);

            return {
              ...image,
              isPanoramic: isPano,
              blobUrl: objectUrl,
            };
          })
        );
        setImages(processed);
        const panoramic = processed.find((img) => img.isPanoramic);
        if (panoramic) {
          setPanoImage(panoramic.blobUrl);
        }
      } catch (error) {
        console.error("Error processing images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyImages?.length) processImages();

    return () => {
      images.forEach((image) => {
        if (image.blobUrl) URL.revokeObjectURL(image.blobUrl);
      });
    };
  }, [propertyImages]);

  // Load panoramic image
  useEffect(() => {
    const panoramic = images.find((img) => img.isPanoramic);
    if (panoramic) {
      setPanoImage(panoramic.blobUrl);
    } else {
      setErrorMessage("No panoramic image found.");
    }
  }, [images]);

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // Main Image Renderer
  const renderMainImage = () => {
    const mainImage = images.find((img) => img.isPanoramic) || images[0];

    return (
      <div
        className={`w-full lg:w-1/2 h-64 lg:h-full rounded-lg shadow-md flex items-center justify-center ${
          darkMode ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        {mainImage ? (
          mainImage.isPanoramic ? (
            panoImage ? (
              <Pannellum
                width="100%"
                height="100%"
                image={panoImage}
                pitch={10}
                yaw={180}
                hfov={110}
                autoLoad
                onLoad={() => console.log("Panorama loaded")}
              />
            ) : (
              <p>Loading panorama...</p>
            )
          ) : (
            <img
              src={mainImage.blobUrl || mainImage.link}
              alt={mainImage.name || "Main Image"}
              className="h-full w-full object-cover rounded-lg"
            />
          )
        ) : (
          <p>No Image Available</p>
        )}
      </div>
    );
  };

  // Thumbnail Renderer
  const renderThumbnails = () => {
    const thumbnails = images.slice(1, 5);

    return (
      <div className="grid grid-cols-4 lg:grid-cols-2 gap-4 lg:grid-rows-2 w-full lg:w-1/2">
        {images.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className={`h-24 lg:h-full rounded-md shadow-md flex items-center justify-center ${
              darkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
          >
            <img
              src={image.link || "/placeholder-image.jpg"}
              alt={`Thumbnail ${index + 1}`}
              className="h-full w-full object-cover rounded-md"
            />
          </div>
        ))}

        {/* Add placeholders for missing images */}
        {Array.from({
          length: Math.max(0, 4 - (images.length - 1)),
        }).map((_, index) => (
          <div
            key={`placeholder-${index}`}
            className={`h-24 lg:h-full rounded-md shadow-md ${
              darkMode ? "bg-gray-700" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>
    );
  };

  if (!propertyImages?.length) {
    return <p>{errorMessage || "No images available."}</p>;
  }

  return (
    <div className="w-full lg:w-3/4">
      <div className="relative flex flex-col lg:flex-row h-auto lg:h-96 gap-4">
        {renderMainImage()}
        {renderThumbnails()}
      </div>
    </div>
  );
};

export default RenderImage;
