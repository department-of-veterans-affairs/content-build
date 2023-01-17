/**
 * Returns true if two arrays contain the same strings (in any order)
 */
export const stringArraysContainSameElements = (a, b) => {
  return a.sort().join(',') === b.sort().join(',');
};

/**
 * Searches a sidebar menu link to find a child with given attributes, and returns the child object
 */
export const findSidebarMenuLinkBySectionAndOptionalLabel = (
  parent,
  menuSection,
  label,
) =>
  parent
    ? parent.find(
        link =>
          link.entity.fieldMenuSection === menuSection &&
          (label ? link.label === label : true),
      )
    : undefined;
