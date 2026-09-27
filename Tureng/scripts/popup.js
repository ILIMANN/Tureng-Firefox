"use strict";

const parser = new DOMParser();

function cleanAndDecode(str) {
  const cleaned = safeResponse.cleanDomString(str);
  const doc = parser.parseFromString(cleaned, "text/html");
  return doc.documentElement.textContent;
}

function Word(id, usage, word, type, definition, definitionType) {
  this.id = id;
  this.usage = usage;
  this.word = word;
  this.type = type;
  this.definition = definition;
  this.definitionType = definitionType;
}

function noResultContent(str) {
  const alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-warning";
  alertDiv.setAttribute("role", "alert");

  alertDiv.appendChild(
    document.createTextNode(
      "Maalesef bir sonuç bulamadık, kelimeyi basitleştirmeyi deneyin ya da "
    )
  );

  const link = document.createElement("a");
  link.href = `https://www.google.com/search?q=${encodeURIComponent(str)}`;
  link.target = "_blank";

  link.appendChild(document.createTextNode("Google"));
  alertDiv.appendChild(link);

  return alertDiv;
}

function suggestedQueries(str, suggestionList) {
  const listGroup = document.createElement("div");
  listGroup.className = "list-group";

  const mainLink = document.createElement("a");
  mainLink.href = `https://www.google.com/search?q=${encodeURIComponent(str)}`;
  mainLink.target = "_blank";
  mainLink.className = "list-group-item active";

  mainLink.appendChild(document.createTextNode("Bunlardan biri değilse, "));

  const icon = document.createElement("i");
  icon.className = "fa fa-google";
  icon.setAttribute("aria-hidden", "true");
  mainLink.appendChild(icon);

  mainLink.appendChild(document.createTextNode("oogle'layın!"));

  listGroup.appendChild(mainLink);

  suggestionList.forEach((li) => {
    const a = document.createElement("a");
    a.href = "#";
    a.className = "list-group-item list-group-item-action";
    a.textContent = cleanAndDecode(li.textContent.trim());
    a.addEventListener("click", () => tureng(a.textContent));
    listGroup.appendChild(a);
  });

  return listGroup;
}

function createTableHeader(c2Text, c3Text) {
  const thead = document.createElement("thead");
  thead.className = "table-light";

  const headerRow = document.createElement("tr");

  const th1 = document.createElement("th");
  th1.textContent = "#";

  const th2 = document.createElement("th");
  th2.textContent = cleanAndDecode(c2Text);

  const th3 = document.createElement("th");
  th3.textContent = cleanAndDecode(c3Text);

  headerRow.append(th1, th2, th3);
  thead.appendChild(headerRow);

  return thead;
}

function createTranslationRow(translation) {
  const tr = document.createElement("tr");

  // Usage
  const thRow = document.createElement("th");
  thRow.scope = "row";
  thRow.className = "align-middle";
  thRow.textContent = cleanAndDecode(translation.usage);

  // Word
  const tdWord = document.createElement("td");
  const wordLink = document.createElement("a");
  wordLink.dataset.href = cleanAndDecode(translation.word);
  console.log(cleanAndDecode(translation.word));
  wordLink.textContent = cleanAndDecode(translation.word);
  tdWord.appendChild(wordLink);

  if (translation.type) {
    const smallType = document.createElement("small");
    smallType.textContent = `(${cleanAndDecode(translation.type)})`;
    tdWord.appendChild(smallType);
  }

  // Definition
  const tdDef = document.createElement("td");
  const defLink = document.createElement("a");
  defLink.dataset.href = cleanAndDecode(translation.definition);
  defLink.textContent = cleanAndDecode(translation.definition);
  tdDef.appendChild(defLink);

  if (translation.definitionType) {
    const smallDefType = document.createElement("small");
    smallDefType.textContent = `(${cleanAndDecode(
      translation.definitionType
    )})`;
    tdDef.appendChild(smallDefType);
  }

  tr.append(thRow, tdWord, tdDef);
  return tr;
}

function createTranslationTable(tableElement) {
  const rows = Array.from(tableElement.querySelectorAll("tr")).slice(1);

  const newTable = document.createElement("table");
  newTable.className = "table table-striped table-hover";

  newTable.appendChild(
    createTableHeader(
      tableElement.querySelector("tr .c2").textContent,
      tableElement.querySelector("tr .c3").textContent
    )
  );

  const tbody = document.createElement("tbody");
  newTable.appendChild(tbody);

  rows.forEach((el) => {
    const tds = el.querySelectorAll("td");
    if (tds.length < 4) return;

    const translation = new Word(
      tds[0].textContent,
      tds[1].textContent.trim(),
      tds[2].querySelector("a")?.textContent.trim() || "",
      tds[2].querySelector("i")?.textContent.trim() || "",
      tds[3].querySelector("a")?.textContent.trim() || "",
      tds[3].querySelector("i")?.textContent.trim() || ""
    );

    tbody.appendChild(createTranslationRow(translation));
  });

  // Toggle body display on header click
  newTable.querySelector("thead").addEventListener("click", () => {
    tbody.style.display = tbody.style.display === "none" ? "" : "none";
  });

  tbody.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => tureng(a.dataset.href));
  });

  return newTable;
}

function createSummaryBox(sectionElement) {
  const tdField = sectionElement.querySelector(".td-field");
  const tdDefinition = sectionElement.querySelector(".td-definition");

  if (!tdField && !tdDefinition) return null;

  const summarySection = document.createElement("section");
  summarySection.className = "term-description-box";

  const dl = document.createElement("dl");

  if (tdField) {
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "td-field";

    const dtText = tdField.querySelector("dt")?.textContent.trim();
    if (dtText) {
      const dt = document.createElement("dt");
      dt.textContent = cleanAndDecode(dtText);
      fieldDiv.appendChild(dt);
    }

    const ddEl = tdField.querySelector("dd");
    if (ddEl) {
      const dd = document.createElement("dd");
      const links = ddEl.querySelectorAll("a");

      if (links.length > 0) {
        links.forEach((a, index) => {
          const term = cleanAndDecode(a.textContent.trim());
          const link = document.createElement("a");
          link.href = "#";
          link.dataset.href = term;
          link.textContent = term;
          link.addEventListener("click", (e) => {
            e.preventDefault();
            tureng(term);
          });
          dd.appendChild(link);

          if (index < links.length - 1) {
            dd.appendChild(document.createTextNode(", "));
          }
        });
      } else {
        dd.textContent = cleanAndDecode(ddEl.textContent.trim());
      }

      fieldDiv.appendChild(dd);
    }

    dl.appendChild(fieldDiv);
  }

  if (tdDefinition) {
    const defText = tdDefinition.querySelector("dd")?.textContent.trim();
    if (defText) {
      const defDiv = document.createElement("div");
      defDiv.className = "td-definition";

      const dd = document.createElement("dd");
      dd.textContent = cleanAndDecode(defText);

      defDiv.appendChild(dd);
      dl.appendChild(defDiv);
    }
  }

  summarySection.appendChild(dl);
  return summarySection;
}

function notFound(str) {
  document.getElementById("content").appendChild(noResultContent(str));
  document.getElementById("loading").style.display = "none";
}

function resetContentElement() {
  document.getElementById("content").textContent = "";
  document.getElementById("content").replaceChildren();
}

function resetSearchUI(str) {
  resetContentElement();
  document.getElementById("search-input").value = str;
  document.getElementById("loading").style.display = "block";
  document.getElementsByClassName("inner-shadow")[0].style.backgroundColor =
    "#BD1E2C";

  document.querySelectorAll(".pie, .dot span").forEach((el) => {
    el.style.backgroundColor =
      "#" + (((1 << 24) * Math.random()) | 0).toString(16);
  });

  return str;
}

function tureng(str) {
  str = resetSearchUI(str);

  browser.runtime
  .sendMessage({ type: "TURENG_SEARCH", query: str })
  .then((response) => {
    if (!response || !response.ok) {
      notFound(str);
      return;
    }

    const doc = parser.parseFromString(response.html, "text/html");
    const descriptionSection = doc.querySelector("section.term-description-box");
    const checkSearchResults = doc.querySelectorAll(".searchResultsTable");
    const suggestionList = doc.querySelectorAll("ul.suggestion-list li");

    const contentEl = document.getElementById("content");

    if (suggestionList.length > 0 && checkSearchResults.length === 0) {
      contentEl.appendChild(suggestedQueries(str, suggestionList));
      document.getElementById("voice-tts").style.display = "none";
    } else if (checkSearchResults.length > 0) {
      if (descriptionSection) {
        const summaryBox = createSummaryBox(descriptionSection);
        if (summaryBox) {
          contentEl.appendChild(summaryBox);
        }
      }

      checkSearchResults.forEach((table) => {
        const newTable = createTranslationTable(table);
        contentEl.appendChild(newTable);
      });

      document.getElementById("voice-tts").style.display = "block";
    } else {
      notFound(str);
    }
  })
  .catch(() => {
    notFound(str);
  })
  .finally(() => {
    document.getElementById("loading").style.display = "none";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const input_field = document.getElementById("search-input");
  if (input_field) {
    setTimeout(() => {
      input_field.focus();
      input_field.select();
    }, 50);
  }

  document.getElementById("tureng").addEventListener("click", () => {
    tureng(document.getElementById("search-input").value);
  });

  document.querySelectorAll('[data-toggle="tooltip"]').forEach((el) => {
    new bootstrap.Tooltip(el);
  });
});

document
  .getElementById("search-input")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      tureng(document.getElementById("search-input").value);
    }
  });

// Popup açılışında seçili kelimeyi search_box'a yapıştırır, formu submit eder.
// Paste the selected word to the search_box on popup open, then submit the form.
window.onload = async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  let result;
  try {
    [{ result }] = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => getSelection().toString(),
    });
  } catch (e) {
    return; // ignoring an unsupported page like about:addons
  }

  document.getElementById("search-input").value = result;
  if (result.length > 0) {
    document.getElementById("tureng").click();
  }
};

// TTS
const playPronunciation = async (text, lang) => {
  const trimmed = text.trim();
  if (!trimmed) return;

  try {
    const response = await browser.runtime.sendMessage({
      type: "TURENG_TTS",
      text: trimmed,
      lang,
    });

    if (!response || !response.ok || !response.buffer) return;

    const blob = new Blob([response.buffer], { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    audio.addEventListener("ended", () => URL.revokeObjectURL(audioUrl), {
      once: true,
    });

    await audio.play();
  } catch (e) {
    console.error("playPronunciation()", e);
  }
};

document.getElementById("flag-tr").addEventListener("click", () => {
  playPronunciation(document.getElementById("search-input").value, "tr");
});
document.getElementById("flag-us").addEventListener("click", () => {
  playPronunciation(document.getElementById("search-input").value, "en-us");
});
document.getElementById("flag-uk").addEventListener("click", () => {
  playPronunciation(document.getElementById("search-input").value, "en-gb");
});
document.getElementById("flag-au").addEventListener("click", () => {
  playPronunciation(document.getElementById("search-input").value, "en-au");
});

document.getElementById("tureng-logo").addEventListener("click", () => {
  const query = document.getElementById("search-input").value.trim();
  browser.tabs.create({
    url:
      "https://tureng.com/tr/turkce-ingilizce/" +
      encodeURIComponent(query),
  });
});
