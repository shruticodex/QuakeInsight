import JSZip from "jszip"
import FileSaver from "file-saver"

/**
 * Downloads multiple elements as images and packages them into a zip file
 * @param elements Array of element IDs and filenames to download
 * @param zipFilename The filename for the zip file
 */
export async function downloadElementsAsZip(
  elements: Array<{ elementId: string; filename: string }>,
  zipFilename: string,
) {
  try {
    const zip = new JSZip()

    // Create a folder for the images
    const imgFolder = zip.folder("images")

    if (!imgFolder) {
      throw new Error("Failed to create images folder in zip")
    }

    // Process each element
    for (const element of elements) {
      try {
        const canvas = await createCanvasFromElement(element.elementId)
        if (canvas) {
          // Convert canvas to blob
          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), "image/png")
          })

          if (blob) {
            // Add the image to the zip file
            imgFolder.file(`${element.filename}.png`, blob)
          }
        }
      } catch (elementError) {
        console.error(`Error processing element ${element.elementId}:`, elementError)
        // Continue with other elements
      }
    }

    // Generate the zip file
    const content = await zip.generateAsync({ type: "blob" })

    // Save the zip file
    FileSaver.saveAs(content, `${zipFilename}.zip`)
  } catch (error) {
    console.error("Error creating zip file:", error)
    alert("Failed to download images. Please try again.")
  }
}

/**
 * Creates a canvas from a DOM element
 * @param elementId The ID of the element to convert to canvas
 * @returns A Promise that resolves to a canvas element
 */
async function createCanvasFromElement(elementId: string): Promise<HTMLCanvasElement | null> {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error(`Element with ID "${elementId}" not found`)
      return null
    }

    // Import html2canvas dynamically
    const html2canvas = (await import("html2canvas")).default

    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      useCORS: true, // Handle cross-origin images
      scale: 2, // Higher resolution
      backgroundColor: null, // Transparent background
      logging: false,
    })

    return canvas
  } catch (error) {
    console.error("Error creating canvas:", error)
    return null
  }
}

/**
 * Downloads all charts from a visualization
 * @param chartIds Array of chart IDs to download
 * @param prefix Prefix for the filenames
 */
export async function downloadAllCharts(chartIds: string[], prefix: string) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")

    // Filter out chart IDs that don't exist in the DOM
    const existingChartIds = chartIds.filter((id) => document.getElementById(id) !== null)

    if (existingChartIds.length === 0) {
      console.warn("No chart elements found in the current view")
      alert("No charts found to download. Please make sure you're viewing the correct visualization.")
      return
    }

    const elements = existingChartIds.map((id) => ({
      elementId: id,
      filename: `${prefix}_${id}_${timestamp}`,
    }))

    await downloadElementsAsZip(elements, `${prefix}_charts_${timestamp}`)
  } catch (error) {
    console.error("Error downloading all charts:", error)
    alert("Failed to download charts. Please try again.")
  }
}
