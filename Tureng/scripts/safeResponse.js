"use strict";

const safeResponse = (function () {
  const validAttrs = ["class", "id", "href", "style"];
  const parser = new DOMParser();

  function removeInvalidAttributes(target) {
    const attrs = target.attributes;

    for (let i = attrs.length - 1; i >= 0; i--) {
      const currentAttr = attrs[i].name;

      if (attrs[i].specified && !validAttrs.includes(currentAttr)) {
        target.removeAttribute(currentAttr);
      }

      if (
        currentAttr === "href" &&
        /^(#|javascript[:])/i.test(target.getAttribute("href"))
      ) {
        target.parentNode?.removeChild(target);
        break;
      }
    }
  }

  function cleanDomString(data) {
    const tmpDom = parser.parseFromString(data, "text/html").body;

    const scriptsAndImages = tmpDom.querySelectorAll("script,img");
    for (let i = scriptsAndImages.length - 1; i >= 0; i--) {
      scriptsAndImages[i].remove();
    }

    const elements = tmpDom.getElementsByTagName("*");
    for (let i = elements.length - 1; i >= 0; i--) {
      removeInvalidAttributes(elements[i]);
    }

    return tmpDom.innerHTML;
  }

  return {
    cleanDomString,
  };
})();