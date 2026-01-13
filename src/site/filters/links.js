const processLink = (title, urlString) => {
  // may throw if we get something that's not a URL in the data
  const url = new URL(urlString);
  const hostnameParts = url.hostname.split('.');
  // just retrieving the domain part i.e. facebook/flickr/twitter
  return {
    key: hostnameParts.slice(-2, -1)[0],
    value: {
      title,
      uri: url.pathname,
    },
  };
};

module.exports = {
  processLink,
};
