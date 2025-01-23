export const mockIdentificationResult = {
  "id": "mock-id-123",
  "metaData": {
    "date": "2025-01-21",
    "datetime": "2025-01-21T11:48:20+08:00"
  },
  "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRg..."],
  "suggestions": [
    {
      "id": 1,
      "plantName": "Orchid",
      "scientificName": "Phalaenopsis amabilis",
      "probability": 0.92,
      "plantDetails": {
        "commonNames": ["Moth Orchid", "Moon Orchid", "White Star Orchid"],
        "description": "The Moth Orchid is one of the most popular indoor orchids, known for its long-lasting flowers and ease of care. Its elegant white flowers resemble moths in flight.",
        "taxonomy": {
          "kingdom": "Plantae",
          "family": "Orchidaceae",
          "genus": "Phalaenopsis",
          "order": "Asparagales",
          "phylum": "Tracheophyta",
          "class": "Liliopsida"
        },
        "url": "https://www.bing.com/search?q=Phalaenopsis+amabilis",
        "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Phalaenopsis_amabilis.jpg/800px-Phalaenopsis_amabilis.jpg"
      }
    },
    {
      "id": 2,
      "plantName": "Indoor Plant",
      "scientificName": "",
      "probability": 0.85,
      "plantDetails": {
        "commonNames": ["House Plant"],
        "description": "A decorative indoor plant with green foliage.",
        "taxonomy": {
          "kingdom": "Plantae",
          "family": "",
          "genus": "",
          "order": "",
          "phylum": "Tracheophyta",
          "class": "Plant"
        },
        "url": "https://www.bing.com/search?q=indoor+plant+care",
        "imageUrl": ""
      }
    }
  ]
};
