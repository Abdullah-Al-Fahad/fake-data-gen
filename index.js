const express = require("express");
const cors = require("cors");
const { base, de, de_CH, en, fr, Faker } = require('@faker-js/faker');

const app = express();
app.use(cors());
app.use(express.json());

// Define a custom locale if needed
const customLocale = {
  title: 'My Custom Locale',
  internet: {
    domainSuffix: ['test'],
  },
};

// Function to create a Faker instance with custom locales and fallbacks
const createFakerInstance = (language) => {
  let localeArray = [customLocale];

  switch (language) {
    case 'de':
      localeArray = [de_CH, de, ...localeArray];
      break;
    case 'fr':
      localeArray = [fr, ...localeArray];
      break;
    default:
      localeArray = [en, ...localeArray];
      break;
  }

  localeArray.push(base);

  return new Faker({
    locale: localeArray,
  });
};

// Helper function for generating review sentences with context and variety
const generateReviewSentence = (fakerInstance, language) => {
  const reviewTemplates = {
    'en': [
      "The {{adjective}} use of {{noun}} makes this a {{adverb}} {{verb}} read.",
      "I was {{adverb}} {{verb}} by how the {{noun}} was handled.",
      "The writing by the author is surprisingly {{adjective}}.",
      "{{Adjective}} {{noun}}s, {{adverb}} {{verb}}ed, but {{adjective}} nonetheless.",
      "While I enjoyed the {{noun}}, the {{adjective}} {{noun}} felt {{adverb}} executed."
    ],
    'de': [
      "Die {{adjective}} Nutzung von {{noun}} macht das Buch zu einem {{adverb}} {{verb}}en Lesevergnügen.",
      "Ich war {{adverb}} {{verb}} darüber, wie das {{noun}} behandelt wurde.",
      "Das der Text von schreibende ist überraschend {{adjective}}.",
      "{{Adjective}} {{noun}}, {{adverb}} {{verb}}t, aber dennoch {{adjective}}.",
      "Obwohl ich das {{noun}} genossen habe, schien das {{adjective}} {{noun}} {{adverb}} umgesetzt."
    ],
    'fr': [
      "L'utilisation {{adjective}} de {{noun}} fait de ce livre une lecture {{adverb}} {{verb}}e.",
      "J'ai été {{adverb}} {{verb}} par la manière dont le {{noun}} a été traité.",
      "Le texte de personne écrivaine est surprenamment {{adjective}}.",
      "{{Adjective}} {{noun}}, {{adverb}} {{verb}}é, mais néanmoins {{adjective}}.",
      "Bien que j'aie apprécié le {{noun}}, le {{adjective}} {{noun}} semblait {{adverb}} exécuté."
    ]
  };

  if (!reviewTemplates[language]) {
    language = 'en'; // Default to English if language not found
  }
  const template = fakerInstance.helpers.arrayElement(reviewTemplates[language]);
  return fakerInstance.helpers.mustache(template, {
    adjective: fakerInstance.word.adjective(),
    Adjective: fakerInstance.word.adjective().replace(/^\w/, (c) => c.toUpperCase()), // Capitalize the first letter
    adverb: fakerInstance.word.adverb(),
    verb: fakerInstance.word.verb(),
    noun: fakerInstance.word.noun(),
    author: fakerInstance.person.fullName(),
  });
};

// Helper function to generate reviews with seeded randomness
const generateReviews = (averageReviews, fakerInstance, language) => {
  const reviews = [];
  const fullReviews = Math.floor(averageReviews);
  const fractionalPart = averageReviews - fullReviews;

  for (let i = 0; i < fullReviews; i++) {
    reviews.push({
      text: generateReviewSentence(fakerInstance, language),
      author: fakerInstance.person.fullName(),
    });
  }

  // Use Faker's seeded random to determine partial reviews
  if (fakerInstance.number.float({ min: 0, max: 1 }) < fractionalPart) {
    reviews.push({
      text: generateReviewSentence(fakerInstance, language),
      author: fakerInstance.person.fullName(),
    });
  }

  return reviews;
};

// Helper function to generate likes
const generateLikes = (averageLikes, fakerInstance) => {
  const baseLikes = Math.floor(averageLikes);
  const fractionalPart = averageLikes - baseLikes;
  return baseLikes + (fakerInstance.number.float({ min: 0, max: 1 }) < fractionalPart ? 1 : 0);
};

// Helper function to capitalize the first letter of each word in a string
const capitalizeWords = (str) => {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Helper function to generate a book
const generateBook = (fakerInstance, language) => {
  const title = capitalizeWords(`${fakerInstance.word.adjective()} ${fakerInstance.word.noun()}`);
  const author = fakerInstance.person.fullName();
  const publisher = fakerInstance.company.name();
  const isbn = fakerInstance.commerce.isbn();

  const coverImage = `https://picsum.photos/seed/${fakerInstance.random.alphaNumeric(10)}/200/300`;

  // Generate likes and reviews
  const likes = generateLikes(5, fakerInstance); // Average likes fixed at 5 for this example
  const reviews = generateReviews(3, fakerInstance, language); // Average reviews fixed at 3 for this example

  return {
    isbn,
    title,
    author,
    publisher,
    likes,
    reviews,
    coverImage,
  };
};

// Generate a fixed dataset of books based on a seed
const generateDataset = (seed, language, totalBooks = 1000) => {
  const fakerInstance = createFakerInstance(language);
  fakerInstance.seed(seed);

  return Array.from({ length: totalBooks }, () => generateBook(fakerInstance, language));
};

// API endpoint to fetch books
app.get("/api/books", (req, res) => {
  const { language = "en", seed = 42, page = 1, pageSize = 20 } = req.query;

  const dataset = generateDataset(Number(seed), language); // Generate the same dataset for the seed
  const start = (page - 1) * pageSize;
  const end = start + Number(pageSize);

  const paginatedBooks = dataset.slice(start, end); // Slice the dataset for pagination

  res.json(paginatedBooks);
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
