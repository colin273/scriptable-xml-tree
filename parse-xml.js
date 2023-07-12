/**
 * @file Scriptable XML Tree Parser
 * @author colin273
 * @license MIT
 * @version 1.0.0
 */

"use strict";


function setIdx(arr, i, val) {
  if (i < 0)
    i += arr.length;
  arr[i] = val;
}


function* iterateTree(tree) {
  yield tree;
  if (tree.childNodes)
    for (const c of tree.childNodes)
      yield* iterateTree(c);
}


/**
 * Element in an XML tree.
 */
class Element {
  /**
   * @param {string} name Tag name
   * @param {?Object.<string, string>} attrs Attributes
   */
  constructor(name, attrs) {
    /**
     * Tag name
     * @type {string}
     */
    this.name = name;
    
    // Using an object as a hash map is unsafe.
    // If an attribute is called "__proto__", then it will be
    // lost by XMLParser.
    // Maps do not have this problem.
    /**
     * Attributes
     * @type {Map<string, string>}
     */
    this.attributes = new Map(attrs && Object.entries(attrs));
    
    /**
     * Child nodes, including elements and text nodes (strings)
     * @type {(Element|string)[]}
     */
    this.childNodes = [];
  }
  
  /**
   * @type {string}
   */
  get innerText() {
    return this.childNodes.map(c => (typeof c === "string") ? c : c.innerText).join("");
  }
  
  /**
   * Child elements. Text nodes are excluded.
   * @type {Element[]}
   */
  get children() {
    return this.childNodes.filter(c => c instanceof Element);
  }
}


/**
 * @callback Filter
 * @param {Element|string} node Node in the tree
 * @returns {boolean} Whether the node satisfies the filter
 */


/**
 * Finds the first node in a tree that satisfies a filter.
 * @param {Element|string} tree Parent node of the subtree to search.
 * @param {Filter} filter
 * @returns {?(Element|string)} First node in the tree, going from top to bottom, that satisfies the filter
 */
function findInTree(tree, filter) {
  for (const t of iterateTree(tree))
    if (filter(t))
      return t;
}


/**
 * Finds all nodes in a tree that satisfy a filter.
 * @param {Element|string} tree Parent node of the subtree to search.
 * @param {Filter} filter
 * @returns {(Element|string)[]} All nodes in the tree, going from top to bottom, that satisfy the filter
 */
function findAllInTree(tree, filter) {
  const items = [];
  for (const t of iterateTree(tree))
    if (filter(t))
      items.push(t);
  return items;
}


/**
 * Parses an XML string into a tree.
 * @param {string} str XML document as a string
 * @returns {Element} Root element of the tree
 * @throws {Error} Will throw if a syntax error is detected in the XML
 */
function parseXML(str) {
  let root;
  let err;
  
  const x = new XMLParser(str);
  const path = [];

  x.didStartElement = (name, attrs) => {
    const e = new Element(name, attrs);
    if (root)
      path.at(-1).childNodes.push(e);
    else
      root = e;
    path.push(e);
  };

  x.didEndElement = () => void path.pop();

  x.foundCharacters = chars => {
    const parent = path.at(-1);
    const lastChild = parent.childNodes.at(-1);
    if (typeof lastChild === "string")
      setIdx(parent.childNodes, -1, lastChild + chars);
    else
      parent.childNodes.push(chars);
  }
  
  x.parseErrorOccurred = e => {
    err = new Error(e)
  };
  
  if (x.parse())
    return root;
  else
    throw err;
}


module.exports = {
  parseXML,
  Element,
  findInTree,
  findAllInTree
};