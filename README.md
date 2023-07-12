# Scriptable XML Tree Parser

Builds a DOM-like tree from an XML document.

## Why?

[Scriptable](https://scriptable.app)’s [`XMLParser`](https://docs.scriptable.app/xmlparser) class is an event-based parser, similar to [SAX](https://en.m.wikipedia.org/wiki/Simple_API_for_XML). This is usable, but the [`DOMParser`](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) interface provided by browsers is more immediately useful. To use `DOMParser` in Scriptable, the user must create a [`WebView`](https://docs.scriptable.app/webview/) and execute JS asynchronously in that browser-like environment.

This tree parser builds on top of `XMLParser`, using parsing events to inform the construction of a tree. The tree structure is inspired by `DOMParser` but is much simpler. The tree as a whole is referenced by its root element rather than another object representing the whole document. Nodes in the tree can either be strings (representing text nodes) or objects (elements). Parsing is synchronous and occurs entirely within the JS context of the module and Scriptable's native bridges; no `WebView` is needed.

## Exports

- `parseXML()`: Parses an XML document (string) into a tree and returns the root element
- `Element`: Class representing an element in the tree
- `findInTree()`: Finds the first element in a tree that satisfies a filter
- `findAllInTree()`: Finds all elements in a tree that satisfy a filter

Detailed documentation, including types, is provided as JSDoc in the source code.

## Usage

```js
const { parseXML, findInTree } = importModule("parse-xml");

const xml = `
<foo bar="baz">
	<hello attr="yes">Example</hello>
</foo>
`;

// Parse the XML document
const tree = parseXML(xml);

// Find an element in the tree
const filter = (node) => node.attributes?.get("attr") === "yes";
const foundElement = findInTree(tree, filter);

// Extract information
console.log(foundElement.name);       // "hello"
console.log(foundElement.innerText);  // "Example"
```

## Compatibility

This module works in Scriptable on iOS 15.4+/macOS 12.3+. The OS version requirement is because `parseXML` uses [`Array.prototype.at`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at) to access the last item of arrays, and JavaScriptCore only added support for this method starting with Safari 15.4.

To use this parser on older OS versions, replace both uses of `Array.prototype.at` with the older `array[array.length - 1]` technique.

## License

This module is available under the MIT license.