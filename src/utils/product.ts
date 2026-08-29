export function getProductImageUrls(
  imagesJson: any,
  colorsJson?: any,
  selectedColor?: string | null
): string[] {
  if (!imagesJson) return [];

  // If already an array
  if (Array.isArray(imagesJson)) {
    return imagesJson.filter((img) => typeof img === "string" && img.trim().length > 0);
  }

  try {
    const parsedImages = typeof imagesJson === "string" ? JSON.parse(imagesJson) : imagesJson;

    if (Array.isArray(parsedImages)) {
      return parsedImages.filter((img) => typeof img === "string" && img.trim().length > 0);
    }

    if (parsedImages && typeof parsedImages === "object") {
      // It's a Record format (object) e.g. {"Default": ["/uploads/..."]} or {"Red": ["/uploads/..."]}
      if (selectedColor && Array.isArray(parsedImages[selectedColor]) && parsedImages[selectedColor].length > 0) {
        return parsedImages[selectedColor];
      }

      if (colorsJson) {
        try {
          const parsedColors = typeof colorsJson === "string" ? JSON.parse(colorsJson) : colorsJson;
          if (Array.isArray(parsedColors) && parsedColors.length > 0) {
            const firstColor = parsedColors[0];
            if (Array.isArray(parsedImages[firstColor]) && parsedImages[firstColor].length > 0) {
              return parsedImages[firstColor];
            }
          }
        } catch {}
      }

      if (Array.isArray(parsedImages["Default"]) && parsedImages["Default"].length > 0) {
        return parsedImages["Default"];
      }

      // Collect all image arrays from any key in the object
      const allUrls: string[] = [];
      Object.values(parsedImages).forEach((val: any) => {
        if (Array.isArray(val)) {
          allUrls.push(...val);
        } else if (typeof val === "string" && val.trim().length > 0) {
          allUrls.push(val.trim());
        }
      });

      if (allUrls.length > 0) return allUrls;
    }
  } catch {
    if (typeof imagesJson === "string" && imagesJson.trim().length > 0) {
      if (imagesJson.includes(",")) {
        return imagesJson.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return [imagesJson.trim()];
    }
  }

  return [];
}

export function getFirstProductImageUrl(
  imagesJson: any,
  colorsJson?: any,
  selectedColor?: string | null
): string {
  const urls = getProductImageUrls(imagesJson, colorsJson, selectedColor);
  return urls.length > 0 ? urls[0] : "/images/placeholder.png";
}
