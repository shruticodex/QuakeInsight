import html2canvas from "html2canvas"

/**
 * Downloads a DOM element as an image
 * @param elementId The ID of the element to download
 * @param filename The filename to save the image as
 * @param format The image format (png or jpeg)
 */
export async function downloadElementAsImage(elementId: string, filename: string, format: "png" | "jpeg" = "png") {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error(`Element with ID "${elementId}" not found`)
      return
    }

    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      useCORS: true, // Handle cross-origin images
      scale: 2, // Higher resolution
      backgroundColor: null, // Transparent background
      logging: false,
    })

    // Convert canvas to data URL
    const dataUrl = format === "png" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.9)

    // Create a link element and trigger download
    const link = document.createElement("a")
    link.download = `${filename}.${format}`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error("Error downloading image:", error)
    alert("Failed to download image. Please try again.")
  }
}
