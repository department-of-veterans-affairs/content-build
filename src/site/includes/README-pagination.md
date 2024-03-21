# Pagination in Drupal static pages

Template: [pagination.drupal.liquid](https://github.com/department-of-veterans-affairs/content-build/blob/main/src/site/includes/pagination.drupal.liquid)

As of March 2024, content-build is using the V3 pagination web component ([docs here](https://design.va.gov/components/pagination)).

On static pages, we cannot dynamically swap content on the page, so a full page reload is necessary for changing between sets of paginated items. The `<va-pagination>` component requires a `pageSelect` event handler, so we use the `updateCurrentPage` function to handle pagination. 

There are two types of pagination methods that we know of. For Resources & Support (`support_resources_article_listing.drupal.liquid`), the pages exist at `/{path}/{pageNumber}`. For Story Listings (`story_listing.drupal.liquid`) and Press Releases (`press_releases_listing.drupal.liquid`), the pages exist at `/{path}/page-{pageNumber}`. This formatting comes from Drupal.

## Code implementation summary

Before the `updateCurrentPage` event handler is fired, we first take the total number of pages passed in by the template and set the `pages` on the `<va-pagination>` parent element. Then we set its `page` attribute based on the landing URL. `<va-pagination>`'s `page` attribute sets the active page number on the component.

When the `updateCurrentPage` event handler is fired, we grab the page number that was clicked (`newPage`) and couple that with the landing URL to form the next page to display.

## Full code explanation

From `pagination.drupal.liquid`:

```
  // Determine whether this is a Resources & Support page, Story Listing or Press Release
  // This data is passed in through those respective templates.
  const addPrefixToPage = !!'{{ pagePrefix }}';

  // Select the `<va-pagination>` element
  const pagination = document.querySelector('va-pagination');

  // The full URL for the page we're looking at currently
  const landingUrl = '{{ entityUrl }}';

  // Make URLs uniform with a trailing slash so appending page numbers will be straightforward
  if (landingUrl.charAt(landingUrl.length - 1) !== '/') {
    landingUrl = `${landingUrl}/`;
  }

  // Break URL into parts, remove empty parts and focus on the last part (the page number if it exists)
  let urlParts = landingUrl.split('/');
  urlParts = urlParts.filter(part => part !== '');
  const lastPart = urlParts[urlParts.length - 1];

  let currentPage;

  // If the end of the URL has a Story Listing or Press Release page format (`/{path}/page-{pageNumber}`)
  // Remove the `page-` part and assign that to the `currentPage` variable
  // Then remove the page data from the URL
  if (lastPart.includes('page')) {
    currentPage = lastPart.replace('page-', '');
    urlParts.pop(lastPart);
  // If the end of the URL has a Resources & Support page format (`/{path}/{pageNumber}`)
  // Assign that to the `currentPage` variable
  // Then remove the page data from the URL
  } else if (Number(lastPart)) {
    currentPage = lastPart;
    urlParts.pop(lastPart);
  // If the end of the URL is not a page number, we've landed on page 1 of a paginated page
  } else {
    currentPage = '1';
  }

  // Assign the `page` attribute to the `<va-pagination>` component
  // This highlights the correct number on the interface
  pagination.setAttribute('page', currentPage);

  // ACTUAL PAGE CLICK HANDLER
  const updateCurrentPage = event => { 
    // Save clicked number
    let newPage = event?.detail?.page;
    let newEntityUrl;

    // If the page is 1, the URL should not include a page number
    if (newPage === '1') {
      newPage = '';
    // If Story Listing or Press Release page format (`/{path}/page-{pageNumber}`)
    // add page- to the newPage variable so it can be used to create the newEntityUrl
    } else if (addPrefixToPage && newPage !== '1') {
      newPage = `page-${newPage}`;
    }

    // Join the segmented URL back together (array is created outside the event handler)
    const joinedUrl = urlParts.join('/');

    // Prepend a forward slash if needed and assign the newEntityUrl
    if (joinedUrl.charAt(0) === '/') {
      newEntityUrl = `${joinedUrl}/${newPage}`;
    } else {
      newEntityUrl = `/${joinedUrl}/${newPage}`;
    }

    // Navigate to the newEntityUrl
    window.location.href = newEntityUrl;
  }

  pagination.addEventListener('pageSelect', updateCurrentPage);
```


