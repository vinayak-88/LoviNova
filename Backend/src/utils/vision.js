const fs = require("fs");
const path = require("path");
const vision = require("@google-cloud/vision");

const keyPath = path.join(__dirname, "vision-key.json");

if (!fs.existsSync(keyPath) && process.env.VISION_KEY_JSON_BASE64) {
  const decoded = Buffer.from(process.env.VISION_KEY_JSON_BASE64, "base64").toString("utf8");
  fs.writeFileSync(keyPath, decoded);
}

const client = new vision.ImageAnnotatorClient({
  keyFilename: keyPath,
});

const isHumanFace = async (imageBuffer) => {

  const request = {
    image: { content: imageBuffer },
    features: [
      { type: "FACE_DETECTION" },
      { type: "LABEL_DETECTION" },
    ],
  };

  const [results] = await client.annotateImage(request);

  const faces = results.faceAnnotations;
  if (!faces || faces.length === 0) throw new Error("No human face detected");
  if (faces.length > 1) throw new Error("Multiple faces detected, please upload only your own photo");

  const labels = results.labelAnnotations.map((l) => l.description);
  const blocked = ["Cartoon", "Animation", "Illustration", "Drawing", "Sketch", "Toy", "Doll", "Fictional character"];
  const hasBlocked = labels.some((l) => blocked.some((b) => l.toLowerCase().includes(b.toLowerCase())));
  if (hasBlocked) throw new Error("Cartoon/Illustration detected");
};

module.exports = { isHumanFace };
