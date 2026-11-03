const sanitizeHtml = require("sanitize-html");

// Only these tags and attributes survive. This is what stops script injection
// (XSS) through blog content, so keep the list small.
const RICH_TEXT = {
  allowedTags: [
    "h2", "h3", "p", "br", "strong", "em", "u", "s", "a",
    "ul", "ol", "li", "blockquote", "code", "pre", "hr", "img",
  ],
  allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  // Drop images whose address was rejected (for example javascript: links)
  exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
};

function cleanHtml(html) {
  return sanitizeHtml(String(html || ""), RICH_TEXT).trim();
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

// Plain text of an HTML string (used for the preview and for "is it empty?")
function toText(html) {
  // Put a space between blocks so "Title</h2><p>Text" doesn't become "TitleText"
  const spaced = String(html || "").replace(/<\/(p|h[1-6]|li|blockquote|pre|div)>/gi, " ");
  const stripped = sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} });
  return decodeEntities(stripped).replace(/\s+/g, " ").trim();
}

function makeExcerpt(html, max = 180) {
  const text = toText(html);
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

module.exports = { cleanHtml, toText, makeExcerpt };
