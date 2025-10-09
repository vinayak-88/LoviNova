const sanitizeHtml = require("sanitize-html");

const validateAndNormalizeName = (name, fieldName)=> {
  if (!name || typeof name !== "string") {
    throw new Error(`${fieldName} is required and must be a string`);
  }

  // Sanitize HTML/JS input
  name = sanitizeData(name)

  // Remove invalid characters, allow letters, spaces, hyphens, apostrophes
  name = name.replace(/[^a-zA-Z\s'-]/g, "");

  // Normalize spaces and convert to lowercase (optional)
  let normalizedName = name.replace(/\s+/g, " ").toLowerCase();

  // Check for empty after cleaning
  if (!normalizedName) {
    throw new Error(`Please enter a valid ${fieldName}`);
  }

  // Length validation
  if (normalizedName.length < 2 || normalizedName.length > 30) {
    throw new Error(`${fieldName} must be between 3 and 30 characters`);
  }

  normalizedName = capitalizeName(normalizedName)

  return normalizedName;
}

const capitalizeName = (name)=> {
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const sanitizeData = (data)=>{
   const sanitizedData = sanitizeHtml(data, { allowedTags: [], allowedAttributes: {} }).trim();
   return sanitizedData
}

module.exports = {validateAndNormalizeName, capitalizeName, sanitizeData}
