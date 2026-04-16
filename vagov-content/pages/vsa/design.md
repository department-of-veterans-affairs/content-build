---
# Page setup.
layout: page-breadcrumbs.html
template: detail-page
hidesidenav: true

# The title of the tab.
title: VSA design patterns and components

# This line indicates that this page is not to be built to production (www.va.gov)
vagovprod: false

# This line indicates whether it should become the "index" page of it's own directory.
# Specifying "false" will build the build at /example.html instead of /example/index.html
permalink: false

# Excludes this page from the sitemap. This isn't really important because we aren't publishing to prod anyway,
# but still good to do.
private: true

includeBreadcrumbs: false
---
<div class="va-introtext vads-u-margin-bottom--2">

  Learn about the commonly used design patterns and components in the Veteran-facing Services Applications (VSA) portfolio that complement those defined in the [VA.gov Design System](https://design.va.gov).

</div>

<nav id="table-of-contents">
  <h2 class="vads-u-margin-bottom--2 vads-u-font-size--lg" id="on-this-page">On this page</h2>
  <ul class="usa-unstyled-list"></ul>
</nav>


## Tabs

Tabs are useful for list that expresses a filtered or unfiltered state of another list.

<details>

<summary>Example tabs</summary>

<code>
@todo - The style behind the tabs aren't included on our content pages, although interestingly the style is stored in the design system repo, https://github.com/department-of-veterans-affairs/veteran-facing-services-tools/blob/master/packages/formation/sass/modules/_va-tabs.scss.
</code>

</details>

## Blue boxes

The blue boxes are useful for listing likely tasks deeper within the main subject.

<details>

<summary>Example blue boxes</summary>

<ul class="usa-grid usa-grid-full vads-u-margin-top--3 vads-u-margin-bottom--4 vads-u-display--flex vads-u-flex-direction--column medium-screen:vads-u-flex-direction--row">
  <li class="featured-content-list-item vads-u-background-color--primary-alt-lightest  vads-u-padding-y--1p5 vads-u-padding-x--1p5 vads-u-margin-bottom--2 medium-screen:vads-u-margin-bottom--0 vads-u-display--flex vads-u-flex-direction--column">
    <b>Cardiology at VA Pittsburgh health care</b>
    <hr class="featured-content-hr vads-u-margin-y--1p5 vads-u-border-color--primary">
    <p class="va-nav-linkslist-description">Learn about our leading clinical cardiology work</p>
    <a class="vads-u-display--block vads-u-padding-top--1 vads-u-text-decoration--none" href="/pittsburgh-health-care/programs/cardiology">
      <span>Read more<i class="fa fa-chevron-right vads-facility-hub-cta-arrow"></i>
      </span>
    </a>
  </li>
  <li class="featured-content-list-item vads-u-background-color--primary-alt-lightest  vads-u-padding-y--1p5 vads-u-padding-x--1p5 vads-u-margin-bottom--2 medium-screen:vads-u-margin-bottom--0 vads-u-display--flex vads-u-flex-direction--column">
    <b>Health care for transgender Veterans</b>
    <hr class="featured-content-hr vads-u-margin-y--1p5 vads-u-border-color--primary">
    <p class="va-nav-linkslist-description">VA Pittsburgh health care provides compassionate care for transgender Veterans</p>
    <a class="vads-u-display--block vads-u-padding-top--1 vads-u-text-decoration--none" href="/pittsburgh-health-care/stories/team-provides-health-care-for-transgender-veterans">
      <span>Read more<i class="fa fa-chevron-right vads-facility-hub-cta-arrow"></i>
      </span>
    </a>
  </li>
  <li class="featured-content-list-item vads-u-background-color--primary-alt-lightest  vads-u-padding-y--1p5 vads-u-padding-x--1p5 vads-u-margin-bottom--2 medium-screen:vads-u-margin-bottom--0 vads-u-display--flex vads-u-flex-direction--column">
    <b>The Mission Act</b>
    <hr class="featured-content-hr vads-u-margin-y--1p5 vads-u-border-color--primary">
    <p class="va-nav-linkslist-description">Find out how to get community care as a VA Pittsburgh health care patient</p>
    <a class="vads-u-display--block vads-u-padding-top--1 vads-u-text-decoration--none" href="https://www.missionact.va.gov/">
      <span>Read more<i class="fa fa-chevron-right vads-facility-hub-cta-arrow"></i>
      </span>
    </a>
  </li>
</ul>

</details>

## Conditional Questions in a form

When including conditional questions on a form (e.g. questions that only show up depending on how a user answers a previous question), our default should be to gather the answer to the first question, have the user click "continue," and then see the additional questions in a following page.  Previously, we had a pattern where we would "reveal" further questions based on a user's selection of a radio option or checkbox.  This can cause accessibility issues with focus and problems for folks with cognitive disabilities. Therefore, we would like to avoid that pattern when possible.

There are some examples where a single field is revealed, which could still be an acceptable pattern, although consider making that single field visible at all times.

This does not apply necessarily to the "list loop" pattern - where the user intentionally clicks a button to answer additional questions.

<details>

<summary>Example conditional question</summary>

<code>
TBD
</code>

</details>

## Hint text

When a detailed form input label is not enough to convey the meaning or purpose of the input, we have three options for including additional information:
1. **Inline with the label**, in the case where the needed clarification is very short, for example:
    -  Date (MM/DD/YYY)
    -  Post-9/11 GI Bill (Chapter 33)
2. **As subtext beneath the label**, in the case where the needed clarification is a little longer, but less than two sentences. These should likely not wrap more than twice for a total of three lines. For example:
    - Phone number / We will only call you if we need more information about your application
    - Utility / For example: electricity, gas, water, sewer
3. **Within an [Additional Info component](https://design.va.gov/components/additional-info) beneath the label**, in cases where the needed clarification is long or complex, requiring more than two sentences, multiple paragraphs, or special formatting, such as bullet points or links.

<details>

<summary>Example hint text</summary>

<code>
TBD
</code>

</details>

<div class="last-updated usa-content">
  Last updated: <time datetime="2020-11-20">February 23rd, 2021</time>
</div>
