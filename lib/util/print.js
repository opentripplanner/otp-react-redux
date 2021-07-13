/**
 * @return the root <html> tag.
 */
function getRootHtmlTag () {
  return document.getElementsByTagName('html')[0]
}

/**
 * Add print-view class to the html tag on print layout components
 * to ensure that iOS scroll fix only applies to non-print views.
 */
export function addPrintViewClassToRootHtml () {
  getRootHtmlTag().setAttribute('class', 'print-view')
}

/**
 * Remove class attribute from html tag,
 * for print layout components when componentWillUnmount runs.
 */
export function clearClassFromRootHtml () {
  getRootHtmlTag().removeAttribute('class')
}
