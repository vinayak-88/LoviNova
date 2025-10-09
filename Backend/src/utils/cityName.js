const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

const validateCity = async (normalizedCityName) => {
  const response = await client.findPlaceFromText({
    params: {
      input: normalizedCityName + ", India",
      inputtype: "textquery",
      fields: ["name", "types"],
      key: process.env.GOOGLE_MAP_API_KEY,
    },
  });
  const candidates = response.data.candidates;

  if (!candidates || candidates.length === 0) {
    throw new Error("Invalid city name");
  }

  // Check if the candidate has a type 'locality' (city/town)
  const isCity = candidates.some((candidate) =>
    candidate.types.some((type) =>
      [
        "locality",
        "administrative_area_level_1",
        "administrative_area_level_2",
      ].includes(type)
    )
  );

  if (!isCity) {
    throw new Error("Invalid city name");
  }
};

module.exports = { validateCity };
