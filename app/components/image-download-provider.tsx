"use client"

import { createContext, useContext, type ReactNode } from "react"
import { downloadElementAsImage } from "../utils/image-download"
import { downloadElementsAsZip, downloadAllCharts } from "../utils/batch-download"

// Create a context to provide the download functionality
type ImageDownloadContextType = {
  downloadImage: (elementId: string, filename: string, format?: "png" | "jpeg") => Promise<void>
  downloadMultipleImages: (
    elements: Array<{ elementId: string; filename: string }>,
    zipFilename: string,
  ) => Promise<void>
  downloadAllCharts: (chartIds: string[], prefix: string) => Promise<void>
}

const ImageDownloadContext = createContext<ImageDownloadContextType | undefined>(undefined)

export function ImageDownloadProvider({ children }: { children: ReactNode }) {
  const downloadImage = async (elementId: string, filename: string, format: "png" | "jpeg" = "png") => {
    await downloadElementAsImage(elementId, filename, format)
  }

  const downloadMultipleImages = async (
    elements: Array<{ elementId: string; filename: string }>,
    zipFilename: string,
  ) => {
    await downloadElementsAsZip(elements, zipFilename)
  }

  const batchDownloadCharts = async (chartIds: string[], prefix: string) => {
    await downloadAllCharts(chartIds, prefix)
  }

  return (
    <ImageDownloadContext.Provider
      value={{
        downloadImage,
        downloadMultipleImages: downloadElementsAsZip,
        downloadAllCharts: batchDownloadCharts,
      }}
    >
      {children}
    </ImageDownloadContext.Provider>
  )
}

export function useImageDownload() {
  const context = useContext(ImageDownloadContext)
  if (context === undefined) {
    throw new Error("useImageDownload must be used within an ImageDownloadProvider")
  }
  return context
}
