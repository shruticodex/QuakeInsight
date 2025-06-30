import L from "leaflet"
/**
 * Downloads a Leaflet map as an image
 * @param mapId The ID of the map container
 * @param filename The filename to save the image as
 */
export function downloadMapAsImage(mapId: string, filename: string) {
  try {
    // Get the map container
    const mapContainer = document.getElementById(mapId)
    if (!mapContainer) {
      console.error(`Map container with ID "${mapId}" not found`)
      alert(`Error: Map container with ID "${mapId}" not found`)
      return
    }

    // Access the Leaflet map instance
    // @ts-ignore - Leaflet adds this property to DOM elements
    const map = mapContainer._leaflet_id ? L.DomUtil.get(mapId)._leaflet_map : null

    if (!map) {
      console.error("Leaflet map instance not found. Make sure the map is fully initialized.")
      alert("Error: Could not access the map for download. Please try again after the map is fully loaded.")
      return
    }

    // Use Leaflet's built-in functionality to get the map as a canvas
    import("leaflet.bigimage")
      .then(() => {
        // BigImage is a Leaflet plugin that allows downloading the map as an image
        // It's dynamically imported to avoid SSR issues
        map.downloadImage({
          format: "png",
          fileName: filename,
          zoomControl: false,
          attributionControl: false,
          scale: 2,
        })
      })
      .catch((error) => {
        console.error("Error loading leaflet.bigimage:", error)
        alert("Failed to download map image. Please try again.")
      })
  } catch (error) {
    console.error("Error downloading map image:", error)
    alert("Failed to download map image. Please try again.")
  }
}
