/* eslint-disable no-console */
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const SITEMAP_URL = `http://${process.env.WEB_HOST || 'localhost'}:${process.env
  .WEB_PORT || 3001}/sitemap-cb.xml`;

const langs = ['espanol'];
const langSuffixes = ['-esp/', '-tag/'];
// with the new language suffixes
const filterByLanguageSuffix = url => {
  return langSuffixes.some(substring => url.endsWith(substring));
};
// with the old implementation, full word `espanol` in url.
// do these urls need to be converted to use the suffix?
const filterByLanguage = url => {
  return langs.some(substring => url.includes(substring));
};

const getUrlsFromXML = body => {
  const $ = cheerio.load(body, { xmlMode: true });
  return $('loc')
    .map((i, el) => $(el).text())
    .get();
};

const parseNonEnglishContent = () => {
  return fetch(SITEMAP_URL)
    .then(res => {
      return res.text();
    })
    .then(body => {
      const urls = getUrlsFromXML(body);
      return [
        ...urls.filter(filterByLanguage),
        ...urls.filter(filterByLanguageSuffix),
      ];
    })
    .then(urls => {
      console.log(urls, 'THE NON ENGLISH CONTENT');
      console.log(urls.length, 'THE NUMBER OF PAGES');
    });
};

parseNonEnglishContent();
