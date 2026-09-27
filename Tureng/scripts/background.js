//Create a function to open the new tab
function newTab(info, tab) {
  const { menuItemId } = info;

  if (menuItemId === "tureng-text-search") {
    browser.tabs.create({
      url:
        "https://tureng.com/tr/turkce-ingilizce/" + info.selectionText.trim(),
    });
  }
}

//Create context menu options.

browser.contextMenus.create({
  title: "Tureng: '%s' ",
  id: "tureng-text-search",
  contexts: ["selection"],
});

//This tells the context menu what function to run when the option is selected

browser.contextMenus.onClicked.addListener(newTab);

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "TURENG_SEARCH") {
    const url =
      "https://tureng.com/tr/turkce-ingilizce/" +
      encodeURIComponent(message.query.trim());

    return fetch(url)
      .then(async (response) => ({
        ok: response.ok,
        status: response.status,
        html: await response.text(),
      }))
      .catch((error) => ({
        ok: false,
        error: error.message,
      }));
  }

  if (message?.type === "TURENG_TTS") {
    const url = `https://translate.google.com/translate_tts?client=tw-ob&ie=UTF-8&q=${encodeURIComponent(
      message.text.trim()
    )}&tl=${encodeURIComponent(message.lang)}`;

    return fetch(url, { credentials: "omit" })
      .then(async (response) => ({
        ok: response.ok,
        status: response.status,
        buffer: response.ok ? await response.arrayBuffer() : null,
      }))
      .catch((error) => ({
        ok: false,
        error: error.message,
      }));
  }
});