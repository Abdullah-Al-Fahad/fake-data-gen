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
    locale: localeArray
  });
};

// Review templates with placeholders
const reviewTemplates = {
  'en': [
    "The {{adjective}} use of {{noun}} makes this a {{adverb}} {{verb}} read.",
    "I was {{adverb}} {{verb}} by how the {{noun}} was handled.",
    "The writing by author is surprisingly {{adjective}}.",
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

// Helper function for generating review sentences with context and variety
const generateReviewSentence = (fakerInstance, language) => {
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
    author: fakerInstance.person.fullName()
  });
};

// Helper function to generate reviews with varied tones
const generateReviews = (averageReviews, fakerInstance, language) => {
  const reviews = [];
  const fullReviews = Math.floor(averageReviews);
  const partialReviewProbability = averageReviews - fullReviews;

  for (let i = 0; i < fullReviews; i++) {
    reviews.push({
      text: generateReviewSentence(fakerInstance, language),
      author: fakerInstance.person.fullName(),
    });
  }

  if (Math.random() < partialReviewProbability) {
    reviews.push({
      text: generateReviewSentence(fakerInstance, language),
      author: fakerInstance.person.fullName(),
    });
  }

  return reviews;
};

// Helper function to generate likes
const generateLikes = (averageLikes) => {
  const baseLikes = Math.floor(averageLikes);
  const fractionalPart = averageLikes - baseLikes;
  return baseLikes + (Math.random() < fractionalPart ? 1 : 0);
};

// Helper function to capitalize the first letter of each word in a string
const capitalizeWords = (str) => {
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Helper function to generate a book
const generateBook = (language, seed, likes, reviews) => {
  const fakerInstance = createFakerInstance(language);
  fakerInstance.seed(seed);
  const title = capitalizeWords(`${fakerInstance.word.adjective()} ${fakerInstance.word.noun()}`);
  const author = fakerInstance.person.fullName();
  const publisher = fakerInstance.company.name();
  const isbn = fakerInstance.commerce.isbn();

  const coverImage = `https://picsum.photos/seed/${seed}/200/300`; 

  // Generate likes and reviews
  const generatedLikes = generateLikes(likes);
  const generatedReviews = generateReviews(reviews, fakerInstance, language);

  return {
    isbn,
    title,
    author,
    publisher,
    likes: generatedLikes,
    reviews: generatedReviews,
    coverImage,
  };
};

// API endpoint to fetch books
app.get("/api/books", (req, res) => {
  const { language = "en", seed = 42, likes = 5, reviews = 3, page = 1 } = req.query;

  // Generate 20 books for the current page
  const books = Array.from({ length: 20 }, (_, index) => {
    const combinedSeed = Number(seed) + (Number(page) - 1) * 20 + index;
    return generateBook(language, combinedSeed, Number(likes), Number(reviews));
  });

  res.json(books);
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});