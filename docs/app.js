(() => {
  if (window.__floPoweredVibeInit) return;
  window.__floPoweredVibeInit = true;

  const mobileTabs = document.querySelectorAll(".mobile-tab");
  const desktopTabs = document.querySelectorAll(".desktop-tab");
  const panels = document.querySelectorAll(".panel");
  const lessons = document.querySelectorAll(".lesson");
  const nameInput = document.getElementById("nameInput");
  const createUserCard = document.getElementById("createUserCard");
  const welcomeName = document.getElementById("welcomeName");
  const profilePreview = document.getElementById("profilePreview");
  const avatars = document.querySelectorAll(".avatar");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const dbStatus = document.getElementById("dbStatus");
  const goUserButton = document.querySelector(".goUser");

  const desktopQuery = window.matchMedia("(min-width: 1024px)");
  let selectedAvatar = "🌱";
  let db = null;

  function setPanelAnimation(targetPanel) {
    panels.forEach((panel) => panel.classList.remove("fade-in"));
    if (targetPanel) targetPanel.classList.add("fade-in");
  }

  function styleTabButton(button, active) {
    if (button.classList.contains("desktop-tab")) {
      button.classList.toggle("bg-moss", active);
      button.classList.toggle("text-white", active);
      button.classList.toggle("border-moss", active);
      button.classList.toggle("bg-white", !active);
      button.classList.toggle("text-ink", !active);
      button.classList.toggle("border-sage", !active);
    } else {
      button.classList.toggle("text-moss", active);
      button.classList.toggle("border-b-2", active);
      button.classList.toggle("border-moss", active);
      button.classList.toggle("text-ink/70", !active);
    }
  }

  function setTab(target) {
    mobileTabs.forEach((tab) =>
      styleTabButton(tab, tab.dataset.tab === target),
    );
    desktopTabs.forEach((tab) =>
      styleTabButton(tab, tab.dataset.tab === target),
    );

    let activePanel = null;
    panels.forEach((panel) => {
      const isActive = panel.dataset.panel === target;
      panel.classList.toggle("hidden", !isActive);
      if (isActive) activePanel = panel;
    });
    setPanelAnimation(activePanel);
  }

  function refreshAvatarUI() {
    avatars.forEach((button) => {
      const active = button.dataset.avatar === selectedAvatar;
      button.classList.toggle("border-moss", active);
      button.classList.toggle("bg-mint", active);
    });
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("floPoweredAcademyDB", 1);
      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains("kv")) {
          database.createObjectStore("kv", { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function dbSet(key, value) {
    if (!db) {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const tx = db.transaction("kv", "readwrite");
      tx.objectStore("kv").put({ key, value });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function dbGet(key) {
    if (!db) return Promise.resolve(localStorage.getItem(key));
    return new Promise((resolve, reject) => {
      const tx = db.transaction("kv", "readonly");
      const req = tx.objectStore("kv").get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => reject(req.error);
    });
  }

  async function syncProfile() {
    const name = (await dbGet("vibeName")) || "New learner";
    selectedAvatar = (await dbGet("vibeAvatar")) || "🌱";
    welcomeName.textContent = `Hi ${name} ${selectedAvatar}`;
    profilePreview.textContent = `${selectedAvatar} ${name}`;
    nameInput.value = name === "New learner" ? "" : name;
    refreshAvatarUI();
  }

  async function syncLessons() {
    let done = 0;
    for (const lesson of lessons) {
      const checked = (await dbGet(lesson.dataset.lesson)) === "1";
      lesson.checked = checked;
      if (checked) done += 1;
    }
    progressText.textContent = `${done} / ${lessons.length} lessons done`;
    progressBar.style.width = `${(done / lessons.length) * 100}%`;
  }

  [...mobileTabs, ...desktopTabs].forEach((tab) => {
    tab.addEventListener("click", () => setTab(tab.dataset.tab));
  });

  if (goUserButton)
    goUserButton.addEventListener("click", () => setTab("user"));

  lessons.forEach((lesson) => {
    lesson.addEventListener("change", async () => {
      await dbSet(lesson.dataset.lesson, lesson.checked ? "1" : "0");
      await syncLessons();
    });
  });

  avatars.forEach((button) => {
    button.addEventListener("click", async () => {
      selectedAvatar = button.dataset.avatar;
      await dbSet("vibeAvatar", selectedAvatar);
      refreshAvatarUI();
      await syncProfile();
    });
  });

  if (createUserCard) {
    createUserCard.addEventListener("click", async () => {
      await dbSet("vibeName", (nameInput.value || "").trim() || "New learner");
      await dbSet("vibeAvatar", selectedAvatar);
      await syncProfile();
    });
  }

  desktopQuery.addEventListener("change", () => {
    const activeDesktop = [...desktopTabs].find((x) =>
      x.classList.contains("bg-moss"),
    );
    const activeMobile = [...mobileTabs].find((x) =>
      x.classList.contains("border-b-2"),
    );
    const active = (
      activeDesktop ||
      activeMobile || { dataset: { tab: "home" } }
    ).dataset.tab;
    setTab(active);
  });

  async function bootstrap() {
    try {
      db = await openDatabase();
      dbStatus.textContent =
        "Storage: IndexedDB connected (free local database)";
    } catch {
      dbStatus.textContent = "Storage: fallback to localStorage";
    }

    setTab("home");
    await syncProfile();
    await syncLessons();
  }

  bootstrap();
})();
