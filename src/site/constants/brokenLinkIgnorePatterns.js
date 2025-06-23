/*
  This is a set of patterns which the broken link checker should ignore when making a check.

  Given a page dog.html that contains the following three links:
    - /animals/cat.html
    - /animals/horse.html
    - /animals/capybara.html

  If an item in IGNORE_PATTERNS contains 'capybara', it will ignore the third link.
  If an item in IGNORE_PATTERNS contains 'animals', it will ignore ALL the links.

  Note that it's the target URL that checks the ignore pattern. If you included
  'dog' in the IGNORE_PATTERNS in the example above, it would still test dog.html
  for broken links it contains, but block testing dog.html as a destination.

  Be very careful of unintended consequences when adding these patterns. Be
  sure you are targeting what you want to ignore precisely.

  */
const IGNORE_PATTERNS = [
  /\/events($|\/)?/, // This ignores all links to Event and Event Listing pages.
  /\/staff-profiles($|\/)?/, // This ignores all links to Staff Profile pages.
];

module.exports = {
  IGNORE_PATTERNS,
};
