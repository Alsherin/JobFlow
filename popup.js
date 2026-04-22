const saveBtn = document.getElementById("saveBtn");
const list = document.getElementById("list");

saveBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentURL = tabs[0].url;

    chrome.storage.local.get({ savedPages: [] }, (data) => {
      const updatedPages = [...data.savedPages, currentURL];

      chrome.storage.local.set({ savedPages: updatedPages }, () => {
        renderList(updatedPages);
      });
    });
  });
});

function renderList(pages) {
  list.innerHTML = "";
  pages.forEach((page) => {
    const li = document.createElement("li");
    li.textContent = page;
    list.appendChild(li);
  });
}

chrome.storage.local.get({ savedPages: [] }, (data) => {
  renderList(data.savedPages);
});
