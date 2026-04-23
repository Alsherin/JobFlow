document.addEventListener("DOMContentLoaded", () => {

  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const exportBtn = document.getElementById("exportBtn");
  const searchInput = document.getElementById("search");
  const list = document.getElementById("list");

  let allJobs = [];

  // LOAD DATA
  chrome.storage.local.get({ jobs: [] }, (data) => {
    allJobs = data.jobs;
    renderList(allJobs);
  });

  // SAVE JOB
  saveBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      const job = {
        id: Date.now(),
        title: tab.title,
        link: tab.url,
        status: "Saved"
      };

      allJobs.push(job);

      chrome.storage.local.set({ jobs: allJobs }, () => {
        renderList(allJobs);
      });
    });
  });

  // CLEAR ALL
  clearBtn.addEventListener("click", () => {
    allJobs = [];
    chrome.storage.local.set({ jobs: [] }, () => {
      renderList([]);
    });
  });

  // EXPORT
  exportBtn.addEventListener("click", () => {
    let csv = "Title,Status,Link\n";

    allJobs.forEach(job => {
      csv += `${job.title},${job.status},${job.link}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "jobs.csv";
    a.click();
  });

  // SEARCH
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    const filtered = allJobs.filter(job =>
      job.title.toLowerCase().includes(query)
    );

    renderList(filtered);
  });

  // RENDER
  function renderList(jobs) {
    list.innerHTML = "";

    jobs.forEach(job => {
      const li = document.createElement("li");

      li.innerHTML = `
        ${job.title}<br/>
        Status: ${job.status}<br/>
        <button data-id="${job.id}" class="toggle">Toggle</button>
        <button data-id="${job.id}" class="delete">Delete</button>
        <hr/>
      `;

      list.appendChild(li);
    });

    attachEvents();
  }

  // EVENTS
  function attachEvents() {

    document.querySelectorAll(".toggle").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);

        allJobs = allJobs.map(job => {
          if (job.id === id) {
            return {
              ...job,
              status: job.status === "Saved" ? "Applied" : "Saved"
            };
          }
          return job;
        });

        chrome.storage.local.set({ jobs: allJobs }, () => {
          renderList(allJobs);
        });
      });
    });

    document.querySelectorAll(".delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);

        allJobs = allJobs.filter(job => job.id !== id);

        chrome.storage.local.set({ jobs: allJobs }, () => {
          renderList(allJobs);
        });
      });
    });
  }

});
