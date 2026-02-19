(() => {
  if (window.__floPoweredVibeInit) return;
  window.__floPoweredVibeInit = true;

  const courses = [
    {
      id: "intro-vibe-coding",
      name: "Intro to Vibe Coding",
      level: "Beginner",
      overview:
        "Learn the base workflow: ask clearly, review output, test safely, and improve in small steps.",
      segments: [
        {
          title: "What vibe coding means",
          content:
            "Vibe coding means using AI as a coding assistant while you stay in control. You describe goals, review output, run tests, and adjust step by step.",
        },
        {
          title: "Prompt format that works",
          content:
            "Use this simple format: Goal, Context, Constraints, Output format, and Checkpoint. Clear prompts reduce confusion and bad code.",
        },
        {
          title: "Safety and checks",
          content:
            "Always run your code after each small change. Check console logs, test one feature at a time, and keep a copy before major edits.",
        },
        {
          title: "First tiny project",
          content:
            "Build a tiny app: a task list with add/remove. Ask AI for one feature at a time, then run and verify it before requesting the next change.",
        },
      ],
      practice: {
        objective:
          "Build a tiny TODO app with add/remove tasks and one simple style pass.",
        steps: [
          "Create files and run a local dev server.",
          "Implement add task and delete task.",
          "Add one visual style improvement.",
          "Write a short note on what AI got right and wrong.",
        ],
        checklist: [
          "I created the project and can run it locally.",
          "I can add tasks.",
          "I can remove tasks.",
          "I improved the UI and documented my learning.",
        ],
      },
    },
    {
      id: "guided-feature-building",
      name: "Guided Feature Building",
      level: "Beginner+",
      overview:
        "Move from tiny examples to real features with structure, checkpoints, and rollback habits.",
      segments: [
        {
          title: "Break features into slices",
          content:
            "Large features fail when done in one prompt. Break work into slices: data, UI, validation, and error handling.",
        },
        {
          title: "Use acceptance checks",
          content:
            "Before coding, define what done looks like. Example: “User can save note, see note, edit note, and delete note.”",
        },
        {
          title: "Debug with AI correctly",
          content:
            "Share exact error output and current code context. Ask AI to suggest one fix at a time and explain why it should work.",
        },
        {
          title: "Refactor pass",
          content:
            "After it works, request a refactor for readability: smaller functions, clearer names, and less repeated logic.",
        },
      ],
      practice: {
        objective:
          "Add a Notes feature (create/edit/delete) to your app using small implementation slices.",
        steps: [
          "Define acceptance checks before coding.",
          "Implement create + list notes.",
          "Implement edit + delete notes.",
          "Run through your acceptance checks and fix gaps.",
        ],
        checklist: [
          "I wrote acceptance checks before coding.",
          "Create + list notes works.",
          "Edit + delete notes works.",
          "I completed a cleanup/refactor pass.",
        ],
      },
    },
    {
      id: "backend-and-cli-flow",
      name: "Backend + CLI Flow",
      level: "Intermediate",
      overview:
        "Go deeper into terminal-driven workflows with model backends and clear test loops.",
      segments: [
        {
          title: "Terminal-first workflow",
          content:
            "Use terminal scripts to run, test, and lint quickly. AI helps write scripts, but you decide and verify each command.",
        },
        {
          title: "Model backend options",
          content:
            "Use GPT/Claude/Gemini APIs or local models via Ollama. Keep provider keys in environment variables, never hardcoded.",
        },
        {
          title: "PowerShell and CMD basics",
          content:
            "Practice setting environment variables and running commands in both PowerShell and CMD so your workflow is portable.",
        },
        {
          title: "Reliable testing loop",
          content:
            "Adopt this loop: prompt → patch → run → test → review logs → refine prompt. Repeat until acceptance checks pass.",
        },
      ],
      practice: {
        objective:
          "Run your app through a backend-first flow and add one automated test command.",
        steps: [
          "Set model provider env vars in terminal.",
          "Run your app and verify no startup errors.",
          "Add one test command and execute it.",
          "Capture logs and summarize one issue + fix.",
        ],
        checklist: [
          "I configured provider variables in shell.",
          "App starts and runs.",
          "At least one test command works.",
          "I documented one bug and fix.",
        ],
      },
    },
    {
      id: "ship-a-real-app",
      name: "Ship a Real App",
      level: "Intermediate+",
      overview:
        "Final journey course: build and release a harder project with confidence and structure.",
      segments: [
        {
          title: "Project architecture planning",
          content:
            "Define screens, data models, API routes, and success metrics. Ask AI for architecture options and pick one.",
        },
        {
          title: "Implementation roadmap",
          content:
            "Plan work in milestones: authentication, core features, persistence, analytics, and polish.",
        },
        {
          title: "Release readiness",
          content:
            "Prepare deployment checklist: env vars, error states, fallback UX, and smoke tests.",
        },
        {
          title: "Post-release learning",
          content:
            "After release, review usage, top issues, and performance. Ask AI for improvements based on real feedback.",
        },
      ],
      practice: {
        objective:
          "Build and ship FlowBuddy Planner: multi-user goals, reminders, and weekly progress view.",
        steps: [
          "Create roadmap milestones.",
          "Implement two major features end-to-end.",
          "Deploy and run smoke tests.",
          "Write a short post-release improvement plan.",
        ],
        checklist: [
          "Roadmap created and followed.",
          "Two major features completed.",
          "Deployment succeeded with smoke tests.",
          "Post-release improvement plan written.",
        ],
      },
    },
  ];

  const mobileTabs = document.querySelectorAll(".mobile-tab");
  const desktopTabs = document.querySelectorAll(".desktop-tab");
  const panels = document.querySelectorAll(".panel");
  const courseList = document.getElementById("courseList");
  const welcomeName = document.getElementById("welcomeName");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const dbStatus = document.getElementById("dbStatus");

  const learnerCardForm = document.getElementById("learnerCardForm");
  const nameInput = document.getElementById("nameInput");
  const profilePreview = document.getElementById("profilePreview");
  const avatars = document.querySelectorAll(".avatar");

  const studioCourseTitle = document.getElementById("studioCourseTitle");
  const studioLevel = document.getElementById("studioLevel");
  const studioOverview = document.getElementById("studioOverview");
  const segmentCounter = document.getElementById("segmentCounter");
  const segmentTitle = document.getElementById("segmentTitle");
  const segmentContent = document.getElementById("segmentContent");
  const segmentTask = document.getElementById("segmentTask");

  const prevSegment = document.getElementById("prevSegment");
  const nextSegment = document.getElementById("nextSegment");
  const completeSegment = document.getElementById("completeSegment");

  const practiceCourseTitle = document.getElementById("practiceCourseTitle");
  const practiceObjective = document.getElementById("practiceObjective");
  const practiceSteps = document.getElementById("practiceSteps");
  const practiceChecklist = document.getElementById("practiceChecklist");

  const goProfileButton = document.querySelector(".goProfile");
  const desktopQuery = window.matchMedia("(min-width: 1024px)");

  let db = null;
  let selectedAvatar = "🌱";
  let activeCourseId = courses[0].id;
  let activeSegmentIndex = 0;

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
    panels.forEach((panel) =>
      panel.classList.toggle("hidden", panel.dataset.panel !== target),
    );
  }

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("floPoweredAcademyDB", 2);
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

  function getActiveCourse() {
    return courses.find((c) => c.id === activeCourseId) || courses[0];
  }

  function refreshAvatarUI() {
    avatars.forEach((button) => {
      const active = button.dataset.avatar === selectedAvatar;
      button.classList.toggle("border-moss", active);
      button.classList.toggle("bg-mint", active);
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

  function renderCourseLibrary() {
    courseList.innerHTML = "";
    courses.forEach((course, idx) => {
      const card = document.createElement("article");
      card.className = "rounded-xl border border-sage bg-mint/40 p-4";
      card.innerHTML = `
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-moss">Course ${idx + 1}</p>
        <h3 class="mt-1 text-lg font-semibold">${course.name}</h3>
        <p class="mt-1 text-xs text-ink/60">Level: ${course.level}</p>
        <p class="mt-2 text-sm text-ink/80">${course.overview}</p>
        <button class="course-select mt-3 rounded-xl bg-moss px-4 py-2 text-sm font-semibold text-white hover:bg-forest" data-course="${course.id}">Start this course</button>
      `;
      courseList.appendChild(card);
    });

    courseList.querySelectorAll(".course-select").forEach((button) => {
      button.addEventListener("click", async () => {
        activeCourseId = button.dataset.course;
        activeSegmentIndex = 0;
        await dbSet("activeCourseId", activeCourseId);
        await dbSet("activeSegmentIndex", String(activeSegmentIndex));
        renderStudio();
        renderPractice();
        setTab("studio");
      });
    });
  }

  async function renderStudio() {
    const course = getActiveCourse();
    const segment = course.segments[activeSegmentIndex] || course.segments[0];

    studioCourseTitle.textContent = course.name;
    studioLevel.textContent = course.level;
    studioOverview.textContent = course.overview;
    segmentCounter.textContent = `Segment ${activeSegmentIndex + 1} / ${course.segments.length}`;
    segmentTitle.textContent = segment.title;
    segmentContent.textContent = segment.content;

    const notesKey = `segmentNote:${course.id}:${activeSegmentIndex}`;
    segmentTask.value = (await dbGet(notesKey)) || "";
  }

  async function renderPractice() {
    const course = getActiveCourse();
    practiceCourseTitle.textContent = `${course.name} — Practical`;
    practiceObjective.textContent = course.practice.objective;

    practiceSteps.innerHTML = "";
    course.practice.steps.forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      practiceSteps.appendChild(li);
    });

    practiceChecklist.innerHTML = "";
    for (let i = 0; i < course.practice.checklist.length; i += 1) {
      const text = course.practice.checklist[i];
      const key = `practice:${course.id}:${i}`;
      const checked = (await dbGet(key)) === "1";
      const row = document.createElement("label");
      row.className = "flex items-start gap-2";
      row.innerHTML = `<input type="checkbox" class="practice-check mt-0.5" data-key="${key}" ${checked ? "checked" : ""} /> <span>${text}</span>`;
      practiceChecklist.appendChild(row);
    }

    practiceChecklist.querySelectorAll(".practice-check").forEach((input) => {
      input.addEventListener("change", async () => {
        await dbSet(input.dataset.key, input.checked ? "1" : "0");
        await syncProgress();
      });
    });
  }

  async function syncProgress() {
    let done = 0;
    let total = 0;

    for (const course of courses) {
      for (let i = 0; i < course.segments.length; i += 1) {
        total += 1;
        const complete = (await dbGet(`segmentDone:${course.id}:${i}`)) === "1";
        if (complete) done += 1;
      }
      for (let i = 0; i < course.practice.checklist.length; i += 1) {
        total += 1;
        const complete = (await dbGet(`practice:${course.id}:${i}`)) === "1";
        if (complete) done += 1;
      }
    }

    progressText.textContent = `${done} / ${total} steps completed`;
    progressBar.style.width = `${(done / Math.max(total, 1)) * 100}%`;
  }

  async function saveCurrentSegmentNote() {
    const course = getActiveCourse();
    await dbSet(
      `segmentNote:${course.id}:${activeSegmentIndex}`,
      segmentTask.value || "",
    );
  }

  async function moveSegment(delta) {
    const course = getActiveCourse();
    const nextIndex = Math.min(
      course.segments.length - 1,
      Math.max(0, activeSegmentIndex + delta),
    );
    if (nextIndex === activeSegmentIndex) return;

    await saveCurrentSegmentNote();
    activeSegmentIndex = nextIndex;
    await dbSet("activeSegmentIndex", String(activeSegmentIndex));
    await renderStudio();
  }

  async function completeCurrentSegment() {
    const course = getActiveCourse();
    await dbSet(`segmentDone:${course.id}:${activeSegmentIndex}`, "1");
    await saveCurrentSegmentNote();
    await syncProgress();

    if (activeSegmentIndex < course.segments.length - 1) {
      await moveSegment(1);
    }
  }

  function bindEvents() {
    [...mobileTabs, ...desktopTabs].forEach((tab) => {
      tab.addEventListener("click", () => setTab(tab.dataset.tab));
    });

    if (goProfileButton)
      goProfileButton.addEventListener("click", () => setTab("profile"));

    learnerCardForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await dbSet("vibeName", (nameInput.value || "").trim() || "New learner");
      await dbSet("vibeAvatar", selectedAvatar);
      await syncProfile();
    });

    avatars.forEach((button) => {
      button.addEventListener("click", async () => {
        selectedAvatar = button.dataset.avatar;
        refreshAvatarUI();
      });
    });

    prevSegment.addEventListener("click", async () => moveSegment(-1));
    nextSegment.addEventListener("click", async () => moveSegment(1));
    completeSegment.addEventListener("click", async () =>
      completeCurrentSegment(),
    );

    segmentTask.addEventListener("input", async () => saveCurrentSegmentNote());

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
  }

  async function bootstrap() {
    try {
      db = await openDatabase();
      dbStatus.textContent =
        "Storage: IndexedDB connected (free local database)";
    } catch {
      dbStatus.textContent = "Storage: fallback to localStorage";
    }

    activeCourseId = (await dbGet("activeCourseId")) || courses[0].id;
    activeSegmentIndex = Number((await dbGet("activeSegmentIndex")) || "0");

    setTab("home");
    renderCourseLibrary();
    await syncProfile();
    await renderStudio();
    await renderPractice();
    await syncProgress();
    bindEvents();
  }

  bootstrap();
})();
