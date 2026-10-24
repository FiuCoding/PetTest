(function () {
  "use strict";

  const oracle = window.PetOracleData;
  if (!oracle) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<p style="padding:20px;color:#fff;background:#7b2d39">测试数据加载失败，请刷新页面重试。</p>'
    );
    return;
  }

  const {
    QUESTIONS,
    DIMENSIONS,
    calculateResult,
    buildNarrative,
    getMetricNotes,
  } = oracle;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  const state = {
    view: "home",
    photoSrc: "",
    photoName: "",
    answers: Array(QUESTIONS.length).fill(null),
    current: 0,
    result: null,
    narrative: null,
    posterBlob: null,
    posterUrl: "",
    transitionTimer: 0,
    toastTimer: 0,
    photoBusy: false,
    transitioning: false,
    navigating: false,
    posterBusy: false,
    activeModal: null,
    modalOpener: null,
  };

  const views = {
    home: $("#view-home"),
    upload: $("#view-upload"),
    transition: $("#view-transition"),
    quiz: $("#view-quiz"),
    result: $("#view-result"),
  };

  const cameraInput = $("#camera-input");
  const galleryInput = $("#gallery-input");
  const uploadEmpty = $("#upload-empty");
  const photoPreview = $("#photo-preview");
  const photoImg = $("#photo-img");
  const photoStatus = $("#photo-status");
  const confirmPhotoButton = $("#confirm-photo");
  const transitionPhoto = $("#transition-photo");
  const quizOptions = $("#quiz-options");
  const quizNext = $("#quiz-next");
  const quizPrev = $("#quiz-prev");
  const quizDots = $("#quiz-dots");
  const reportDetails = $("#report-details");
  const toggleReportButton = $("#toggle-report");
  const toast = $("#toast");

  function createStarfield() {
    const starfield = $("#starfield");
    if (!starfield) return;

    let seed = 0x1f2e3d4c;
    const next = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const fragment = document.createDocumentFragment();
    for (let index = 0; index < 58; index += 1) {
      const star = document.createElement("span");
      const isCross = index % 13 === 0;
      star.className = isCross ? "star star--cross" : "star";
      star.textContent = isCross ? (index % 26 === 0 ? "✦" : "✧") : "";
      star.style.left = `${(next() * 100).toFixed(2)}%`;
      star.style.top = `${(next() * 100).toFixed(2)}%`;
      star.style.setProperty("--size", `${(0.8 + next() * (isCross ? 6 : 2.1)).toFixed(1)}px`);
      star.style.setProperty("--opacity", (0.12 + next() * 0.45).toFixed(2));
      star.style.setProperty("--duration", `${(3.8 + next() * 4.8).toFixed(1)}s`);
      star.style.setProperty("--delay", `${(-next() * 6).toFixed(1)}s`);
      fragment.appendChild(star);
    }
    starfield.appendChild(fragment);
  }

  function showToast(message, duration = 2800) {
    window.clearTimeout(state.toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    state.toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, duration);
  }

  function setView(name) {
    if (!views[name]) return;
    state.view = name;
    Object.entries(views).forEach(([viewName, element]) => {
      const isActive = viewName === name;
      element.hidden = !isActive;
      element.classList.toggle("is-active", isActive);
    });
    document.body.dataset.view = name;
    if (name === "home") {
      document.title = "你家宠物是什么命？· 宠缘签";
    } else if (name === "result" && state.result) {
      document.title = `你的毛孩子是「${state.result.destiny.name}」· 宠缘签`;
    } else if (name === "quiz") {
      document.title = "凭直觉选择 · 宠缘签";
    } else if (name === "upload") {
      document.title = "上传毛孩子的照片 · 宠缘签";
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    if (state.activeModal && state.activeModal !== modal) {
      state.activeModal.hidden = true;
      state.activeModal.setAttribute("aria-hidden", "true");
    }
    state.modalOpener = document.activeElement;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    state.activeModal = modal;
    const panel = $(".modal-panel", modal);
    window.requestAnimationFrame(() => panel && panel.focus());
  }

  function closeModal(modal = state.activeModal) {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    if (state.activeModal === modal) state.activeModal = null;
    if (!state.activeModal) document.body.classList.remove("modal-open");
    if (state.modalOpener && typeof state.modalOpener.focus === "function") {
      state.modalOpener.focus({ preventScroll: true });
    }
    state.modalOpener = null;
  }

  function trapModalFocus(event) {
    if (!state.activeModal || event.key !== "Tab") return;
    const focusable = $$(
      'button:not([disabled]), [href], input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      state.activeModal
    ).filter((element) => !element.hidden && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("照片读取失败，请重新选择。"));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("无法读取这张照片，请换一张 JPG、PNG 或 WebP 图片。"));
      image.src = source;
    });
  }

  async function compressPhoto(file) {
    let source;
    let bitmap = null;

    if ("createImageBitmap" in window) {
      try {
        bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
        source = bitmap;
      } catch (error) {
        bitmap = null;
      }
    }

    if (!source) {
      const dataUrl = await readFileAsDataURL(file);
      source = await loadImage(dataUrl);
    }

    const width = source.width || source.naturalWidth;
    const height = source.height || source.naturalHeight;
    if (!width || !height) {
      throw new Error("这张照片似乎没有可用的画面，请换一张试试。");
    }

    const maxSide = 1440;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    context.fillStyle = "#f3ead9";
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(source, 0, 0, targetWidth, targetHeight);

    if (bitmap && typeof bitmap.close === "function") bitmap.close();

    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    if (!dataUrl || dataUrl === "data:,") {
      throw new Error("照片处理失败，请换一张图片重试。");
    }
    return dataUrl;
  }

  function renderUploadPreview() {
    if (!state.photoSrc) {
      uploadEmpty.hidden = false;
      photoPreview.hidden = true;
      photoImg.removeAttribute("src");
      return;
    }
    uploadEmpty.hidden = true;
    photoPreview.hidden = false;
    photoImg.src = state.photoSrc;
    photoImg.alt = state.photoName ? `${state.photoName} 的照片预览` : "你的宠物照片预览";
    photoStatus.textContent = "照片已就位 · 仅在你的设备本地处理";
  }

  async function handlePhoto(file) {
    if (!file || state.photoBusy) return;
    const looksLikeImage =
      (file.type && file.type.startsWith("image/")) ||
      /\.(jpe?g|png|webp|gif|heic|heif|bmp|avif)$/i.test(file.name || "");

    if (!looksLikeImage) {
      showToast("请选择图片文件，JPG、PNG、WebP 都可以。");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showToast("照片有点大，请选择 25MB 以内的图片。");
      return;
    }

    state.photoBusy = true;
    photoStatus.textContent = "正在把照片放进缘签里…";
    try {
      const processed = await compressPhoto(file);
      state.photoSrc = processed;
      state.photoName = file.name || "宠物照片";
      renderUploadPreview();
      showToast("照片已就位，确认后就能开始答题。");
    } catch (error) {
      console.error(error);
      showToast(error.message || "照片处理失败，请换一张试试。");
      photoStatus.textContent = "照片还没有准备好，可以重新选择。";
    } finally {
      state.photoBusy = false;
    }
  }

  function pickPhoto(kind) {
    if (state.photoBusy) return;
    const input = kind === "camera" ? cameraInput : galleryInput;
    if (!input) return;
    input.value = "";
    input.click();
  }

  function beginFlow() {
    if (state.transitioning) return;
    if (state.result) {
      resetFlowData();
    }
    renderUploadPreview();
    setView("upload");
  }

  function confirmPhoto() {
    if (state.photoBusy) return;
    if (!state.photoSrc) {
      showToast("先拍一张或从相册选一张毛孩子的照片吧。");
      return;
    }

    transitionPhoto.src = state.photoSrc;
    transitionPhoto.alt = state.photoName ? `${state.photoName} 的照片` : "你的宠物照片";
    state.transitioning = true;
    confirmPhotoButton.disabled = true;
    setView("transition");
    window.clearTimeout(state.transitionTimer);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    state.transitionTimer = window.setTimeout(() => {
      state.transitioning = false;
      confirmPhotoButton.disabled = false;
      setView("quiz");
      renderQuestion();
    }, reducedMotion ? 900 : 2850);
  }

  function renderQuestion() {
    const question = QUESTIONS[state.current];
    if (!question) return;
    const selectedId = state.answers[state.current];
    const isLast = state.current === QUESTIONS.length - 1;
    const progress = Math.round(((state.current + 1) / QUESTIONS.length) * 100);

    $("#quiz-tag").textContent = question.tag;
    $("#quiz-hint").textContent = question.hint;
    $("#quiz-question").textContent = question.question;
    $("#quiz-step").textContent = String(state.current + 1);
    $("#quiz-progress-label").textContent = `第 ${state.current + 1} 题 · 共 ${QUESTIONS.length} 题`;
    $("#quiz-percent").textContent = `${progress}%`;
    $("#quiz-progress-bar").style.width = `${progress}%`;
    const progressTrack = $("#quiz-progress");
    progressTrack.setAttribute("aria-valuenow", String(state.current + 1));
    progressTrack.setAttribute("aria-valuetext", `第 ${state.current + 1} 题，共 ${QUESTIONS.length} 题`);

    quizOptions.innerHTML = question.options
      .map(
        (option) => `
          <button
            class="quiz-option${selectedId === option.id ? " is-selected" : ""}"
            type="button"
            role="radio"
            aria-checked="${selectedId === option.id}"
            data-option-id="${option.id}"
          >
            <span class="option-letter">${option.letter}</span>
            <span class="option-copy">
              <b>${option.label}</b>
              <small>${option.detail}</small>
            </span>
            <span class="option-check" aria-hidden="true">
              <svg class="icon"><use href="#icon-check"></use></svg>
            </span>
          </button>
        `
      )
      .join("");

    quizNext.disabled = !selectedId;
    quizNext.innerHTML = `
      <span>${isLast ? "查看它的命格" : "下一题"}</span>
      <svg class="icon" aria-hidden="true"><use href="#icon-${isLast ? "sparkle" : "arrow-right"}"></use></svg>
    `;
    quizPrev.innerHTML = `
      <svg class="icon" aria-hidden="true"><use href="#icon-arrow-left"></use></svg>
      ${state.current === 0 ? "返回照片" : "上一题"}
    `;

    quizDots.innerHTML = QUESTIONS.map((item, index) => {
      const done = Boolean(state.answers[index]);
      const current = index === state.current;
      return `<span class="quiz-dot${done ? " is-done" : ""}${current ? " is-current" : ""}"></span>`;
    }).join("");
  }

  function selectOption(optionId) {
    const question = QUESTIONS[state.current];
    if (!question.options.some((option) => option.id === optionId)) return;
    state.answers[state.current] = optionId;
    $$(".quiz-option", quizOptions).forEach((button) => {
      const selected = button.dataset.optionId === optionId;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-checked", String(selected));
    });
    quizNext.disabled = false;
    renderDotsOnly();
  }

  function renderDotsOnly() {
    quizDots.innerHTML = QUESTIONS.map((item, index) => {
      const done = Boolean(state.answers[index]);
      const current = index === state.current;
      return `<span class="quiz-dot${done ? " is-done" : ""}${current ? " is-current" : ""}"></span>`;
    }).join("");
  }

  function goToNextQuestion() {
    if (state.navigating) return;
    if (!state.answers[state.current]) {
      showToast("先选一个最像你们的答案吧。");
      return;
    }

    if (state.current < QUESTIONS.length - 1) {
      state.navigating = true;
      state.current += 1;
      renderQuestion();
      $(".quiz-card").scrollIntoView({ block: "start", behavior: "smooth" });
      window.setTimeout(() => {
        state.navigating = false;
      }, 260);
      return;
    }

    if (state.answers.some((answer) => !answer)) {
      const missing = state.answers.findIndex((answer) => !answer);
      state.current = missing;
      renderQuestion();
      showToast("还有一题没有完成，补上就能生成缘签。");
      return;
    }

    state.navigating = true;
    try {
      const result = calculateResult(state.answers);
      state.result = result;
      state.narrative = buildNarrative(result);
      renderResult(result, state.narrative);
      setView("result");
      window.setTimeout(() => {
        state.navigating = false;
        animateIndices(result.indices);
      }, 80);
    } catch (error) {
      console.error(error);
      state.navigating = false;
      showToast(error.message || "缘签生成失败，请再试一次。");
    }
  }

  function goToPreviousQuestion() {
    if (state.navigating) return;
    if (state.current === 0) {
      renderUploadPreview();
      setView("upload");
      return;
    }
    state.current -= 1;
    renderQuestion();
    $(".quiz-card").scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function bindEvents() {
    $$('[data-action="start"]').forEach((button) => {
      button.addEventListener("click", beginFlow);
    });

    $("#brand-home").addEventListener("click", () => {
      if (state.view === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setView("home");
      }
    });

    $$('[data-action="go-home"]').forEach((button) => {
      button.addEventListener("click", () => setView("home"));
    });

    $$("[data-pick]").forEach((button) => {
      button.addEventListener("click", () => pickPhoto(button.dataset.pick));
    });

    [cameraInput, galleryInput].forEach((input) => {
      input.addEventListener("change", () => {
        const file = input.files && input.files[0];
        if (file) handlePhoto(file);
      });
    });

    confirmPhotoButton.addEventListener("click", confirmPhoto);
    quizOptions.addEventListener("click", (event) => {
      const option = event.target.closest(".quiz-option");
      if (option) selectOption(option.dataset.optionId);
    });
    quizNext.addEventListener("click", goToNextQuestion);
    quizPrev.addEventListener("click", goToPreviousQuestion);

    toggleReportButton.addEventListener("click", () => {
      const isOpen = toggleReportButton.getAttribute("aria-expanded") === "true";
      toggleReportButton.setAttribute("aria-expanded", String(!isOpen));
      reportDetails.hidden = isOpen;
      $("span", toggleReportButton).textContent = isOpen ? "展开完整缘分报告" : "收起完整报告";
    });

    $$("[data-open-info]").forEach((button) => {
      button.addEventListener("click", () => openModal("info-modal"));
    });

    document.addEventListener("click", (event) => {
      const closeTrigger = event.target.closest("[data-close-modal]");
      if (closeTrigger) {
        closeModal(document.getElementById(closeTrigger.dataset.closeModal));
      }
    });

    $$('[data-action="retest"]').forEach((button) => {
      button.addEventListener("click", () => {
        openModal("confirm-modal");
      });
    });

    $$('[data-action="poster"]').forEach((button) => {
      button.addEventListener("click", generatePoster);
    });
    $("#save-poster").addEventListener("click", () => downloadPoster(true));
    $("#share-poster").addEventListener("click", sharePoster);

    $("#confirm-reset").addEventListener("click", () => {
      closeModal();
      resetFlowData();
      renderUploadPreview();
      setView("upload");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.activeModal) {
        const modal = state.activeModal;
        closeModal(modal);
        return;
      }
      trapModalFocus(event);
    });

    window.addEventListener("beforeunload", (event) => {
      const hasWork =
        Boolean(state.photoSrc) ||
        state.answers.some(Boolean) ||
        Boolean(state.result);
      if (!hasWork) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  function resetFlowData() {
    window.clearTimeout(state.transitionTimer);
    state.transitioning = false;
    state.photoSrc = "";
    state.photoName = "";
    state.answers = Array(QUESTIONS.length).fill(null);
    state.current = 0;
    state.result = null;
    state.narrative = null;
    state.posterBlob = null;
    if (state.posterUrl) URL.revokeObjectURL(state.posterUrl);
    state.posterUrl = "";
    cameraInput.value = "";
    galleryInput.value = "";
    photoImg.removeAttribute("src");
    transitionPhoto.removeAttribute("src");
    $("#poster-image").removeAttribute("src");
    reportDetails.hidden = true;
    toggleReportButton.setAttribute("aria-expanded", "false");
    $("span", toggleReportButton).textContent = "展开完整缘分报告";
    document.title = "你家宠物是什么命？· 宠缘签";
  }

  function renderResult(result, narrative) {
    const destiny = result.destiny;
    const theme = destiny.theme;
    const resultView = views.result;

    resultView.style.setProperty("--d-bg", theme.bg);
    resultView.style.setProperty("--d-bg2", theme.bg2);
    resultView.style.setProperty("--d-accent", theme.accent);
    resultView.style.setProperty("--d-accent-soft", theme.accentSoft);
    resultView.style.setProperty("--d-ink", theme.ink);
    resultView.style.setProperty("--d-aura", theme.aura);

    $("#result-photo").src = state.photoSrc;
    $("#result-photo").alt = `${destiny.name}命格报告中的宠物照片`;
    $("#result-sigil").textContent = destiny.sigil;
    $("#result-english").textContent = destiny.english;
    $("#result-name").textContent = destiny.name;
    $("#result-title").textContent = destiny.title;
    $("#result-quote").textContent = destiny.quote;
    $("#result-signature").textContent = result.signature;
    $("#result-keywords").innerHTML = destiny.keywords
      .map((keyword) => `<span>${keyword}</span>`)
      .join("");

    $("#relation-summary").textContent = `${narrative.summary}${destiny.summary}`;
    const chosenOptions = [result.answers[0], result.answers[1], result.answers[6]];
    $("#answer-pills").innerHTML = chosenOptions
      .map((option) => `<span>${option.label}</span>`)
      .join("");

    $("#report-relation").textContent = narrative.relation;
    $("#report-goodluck").textContent = destiny.goodLuck;
    $("#report-wish").textContent = narrative.wish;
    $("#report-reminder").textContent = destiny.reminder;
    $("#report-closing").textContent = destiny.closing;

    const metricNotes = getMetricNotes(result.indices);
    const metricMap = [
      ["bond", "result-bond", "result-bond-bar", "result-bond-note"],
      ["heal", "result-heal", "result-heal-bar", "result-heal-note"],
      ["luck", "result-luck", "result-luck-bar", "result-luck-note"],
    ];
    metricMap.forEach(([key, valueId, barId, noteId]) => {
      $(`#${valueId}`).textContent = "0";
      $(`#${barId}`).style.width = "0%";
      $(`#${noteId}`).textContent = metricNotes[key];
      const label = DIMENSIONS[key].label;
      $(`#${barId}`).setAttribute("aria-label", label);
      $(`#${barId}`).setAttribute("aria-valuenow", String(result.indices[key]));
      $(`#${barId}`).setAttribute("aria-valuetext", `${label} ${result.indices[key]} 分`);
    });

    $("#score-ranking").innerHTML = result.ranking
      .map(
        (row) => `
          <div class="score-row${row.id === destiny.id ? " is-winner" : ""}">
            <span>${row.name}${row.id === destiny.id ? " · 本次缘签" : ""}</span>
            <b>${row.score}</b>
          </div>
        `
      )
      .join("");

    $("#result-tie-note").textContent = result.isTie
      ? `本次最高分同为 ${result.ranking[0].score} 分，已按固定命格序号优先。${result.tieRule}`
      : `本次最高分为 ${result.ranking[0].score} 分。${result.tieRule} 三项指数由同一组答案独立换算。`;

    reportDetails.hidden = true;
    toggleReportButton.setAttribute("aria-expanded", "false");
    $("span", toggleReportButton).textContent = "展开完整缘分报告";
    state.posterBlob = null;
    if (state.posterUrl) URL.revokeObjectURL(state.posterUrl);
    state.posterUrl = "";
  }

  function animateNumber(element, target, duration = 760) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || duration <= 0) {
      element.textContent = String(target);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));
      if (progress < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  }

  function animateIndices(indices) {
    const map = [
      ["bond", "result-bond", "result-bond-bar"],
      ["heal", "result-heal", "result-heal-bar"],
      ["luck", "result-luck", "result-luck-bar"],
    ];
    map.forEach(([key, valueId, barId], index) => {
      const target = indices[key];
      animateNumber($(`#${valueId}`), target, 620 + index * 120);
      window.setTimeout(() => {
        $(`#${barId}`).style.width = `${target}%`;
      }, 60 + index * 90);
    });
  }

  const POSTER_WIDTH = 1080;
  const POSTER_HEIGHT = 1920;
  const POSTER_SERIF = '"Songti SC", "STSong", "Noto Serif SC", "SimSun", Georgia, serif';
  const POSTER_SANS = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';

  function posterRandom(seedText) {
    let seed = 2166136261;
    for (let index = 0; index < seedText.length; index += 1) {
      seed ^= seedText.charCodeAt(index);
      seed = Math.imul(seed, 16777619);
    }
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function posterRoundRect(ctx, x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, width / 2, height / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function posterArchPath(ctx, x, y, width, height) {
    const radius = width / 2;
    const bottomRadius = 25;
    ctx.beginPath();
    ctx.moveTo(x, y + height - bottomRadius);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, 0, false);
    ctx.lineTo(x + width, y + height - bottomRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRadius, y + height);
    ctx.lineTo(x + bottomRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - bottomRadius);
    ctx.closePath();
  }

  function drawPosterTracking(ctx, text, x, y, spacing, align = "center") {
    const chars = Array.from(text);
    const widths = chars.map((character) => ctx.measureText(character).width);
    const total = widths.reduce((sum, width) => sum + width, 0) + spacing * Math.max(0, chars.length - 1);
    let cursor = align === "center" ? x - total / 2 : x;
    const previousAlign = ctx.textAlign;
    ctx.textAlign = "left";
    chars.forEach((character, index) => {
      ctx.fillText(character, cursor, y);
      cursor += widths[index] + spacing;
    });
    ctx.textAlign = previousAlign;
  }

  function wrapPosterText(ctx, text, maxWidth, maxLines = 4) {
    const characters = Array.from(text);
    const lines = [];
    let line = "";
    const noLeadingPunctuation = "，。；：、！？,.!?;:）】》」』”’";
    characters.forEach((character) => {
      if (character === "\n") {
        lines.push(line);
        line = "";
        return;
      }
      const candidate = line + character;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        if (noLeadingPunctuation.includes(character)) {
          line = candidate;
        } else {
          lines.push(line);
          line = character;
        }
      } else {
        line = candidate;
      }
    });
    if (line) lines.push(line);
    if (lines.length > maxLines) {
      const visible = lines.slice(0, maxLines);
      visible[maxLines - 1] = `${visible[maxLines - 1].replace(/[，。；、,.!?！？]$/, "")}…`;
      return visible;
    }
    return lines;
  }

  function drawPosterSparkle(ctx, x, y, radius, color, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - radius);
    ctx.quadraticCurveTo(x + radius * 0.14, y - radius * 0.14, x + radius, y);
    ctx.quadraticCurveTo(x + radius * 0.14, y + radius * 0.14, x, y + radius);
    ctx.quadraticCurveTo(x - radius * 0.14, y + radius * 0.14, x - radius, y);
    ctx.quadraticCurveTo(x - radius * 0.14, y - radius * 0.14, x, y - radius);
    ctx.fill();
    ctx.restore();
  }

  function drawPosterStars(ctx, theme, random) {
    ctx.save();
    for (let index = 0; index < 86; index += 1) {
      const x = random() * POSTER_WIDTH;
      const y = random() * POSTER_HEIGHT;
      const radius = 0.8 + random() * 2.2;
      ctx.globalAlpha = 0.08 + random() * 0.26;
      ctx.fillStyle = index % 9 === 0 ? theme.accent : "#fff3d4";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let index = 0; index < 7; index += 1) {
      const x = 100 + random() * 880;
      const y = 90 + random() * 1740;
      drawPosterSparkle(ctx, x, y, 4 + random() * 7, theme.accent, 0.14 + random() * 0.22);
    }
    ctx.restore();
  }

  function drawPosterMotif(ctx, theme, random) {
    ctx.save();
    ctx.strokeStyle = theme.accent;
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = 1.5;

    if (theme.motif === "coins") {
      const coins = [
        [104, 330, 44],
        [944, 556, 59],
        [122, 1290, 33],
        [982, 1178, 36],
        [936, 1588, 22],
      ];
      coins.forEach(([x, y, radius]) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeRect(x - radius * 0.25, y - radius * 0.25, radius * 0.5, radius * 0.5);
      });
    } else if (theme.motif === "koi") {
      [0.7, -0.4].forEach((rotation, index) => {
        ctx.save();
        ctx.translate(index === 0 ? 90 : 992, 590 + index * 760);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.moveTo(-54, 0);
        ctx.bezierCurveTo(-18, -48, 44, -38, 73, 0);
        ctx.bezierCurveTo(44, 38, -18, 48, -54, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(73, 0);
        ctx.lineTo(104, -22);
        ctx.lineTo(97, 22);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });
    } else if (theme.motif === "orbs") {
      const orbs = [
        [110, 470, 120],
        [982, 980, 155],
        [104, 1450, 90],
        [906, 1710, 110],
      ];
      orbs.forEach(([x, y, radius]) => {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, theme.accent);
        glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = 0.07;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (theme.motif === "spark") {
      for (let index = 0; index < 12; index += 1) {
        const x = 70 + random() * 940;
        const y = 280 + random() * 1420;
        drawPosterSparkle(ctx, x, y, 6 + random() * 18, theme.accent, 0.08 + random() * 0.08);
      }
    } else if (theme.motif === "shield") {
      const x = 540;
      const y = 1730;
      ctx.globalAlpha = 0.09;
      ctx.beginPath();
      ctx.moveTo(x, y - 80);
      ctx.bezierCurveTo(x + 70, y - 50, x + 106, y - 52, x + 118, y - 45);
      ctx.bezierCurveTo(x + 105, y + 40, x + 62, y + 92, x, y + 122);
      ctx.bezierCurveTo(x - 62, y + 92, x - 105, y + 40, x - 118, y - 45);
      ctx.bezierCurveTo(x - 106, y - 52, x - 70, y - 50, x, y - 80);
      ctx.stroke();
    } else if (theme.motif === "leaves") {
      for (let index = 0; index < 11; index += 1) {
        const x = 50 + random() * 130;
        const y = 360 + random() * 1250;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.7 + random() * 1.6);
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 24, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    } else if (theme.motif === "crown") {
      ctx.globalAlpha = 0.09;
      ctx.beginPath();
      ctx.moveTo(410, 227);
      ctx.lineTo(474, 194);
      ctx.lineTo(540, 235);
      ctx.lineTo(606, 194);
      ctx.lineTo(670, 227);
      ctx.lineTo(648, 154);
      ctx.lineTo(600, 189);
      ctx.lineTo(540, 128);
      ctx.lineTo(480, 189);
      ctx.lineTo(432, 154);
      ctx.closePath();
      ctx.stroke();
    } else if (theme.motif === "paws") {
      const paws = [
        [108, 392, 0.9],
        [966, 720, -0.7],
        [90, 1270, 0.3],
        [984, 1510, 0.8],
      ];
      paws.forEach(([x, y, rotation]) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        ctx.ellipse(0, 10, 17, 13, 0, 0, Math.PI * 2);
        ctx.ellipse(-18, -9, 7, 10, -0.3, 0, Math.PI * 2);
        ctx.ellipse(-4, -20, 7, 10, -0.1, 0, Math.PI * 2);
        ctx.ellipse(11, -18, 7, 10, 0.1, 0, Math.PI * 2);
        ctx.ellipse(23, -6, 7, 10, 0.25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
    }
    ctx.restore();
  }

  function drawPosterMetricRing(ctx, x, y, radius, value, color, label, theme) {
    const start = -Math.PI / 2;
    const end = start + Math.PI * 2;
    ctx.save();
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255, 248, 235, 0.13)";
    ctx.beginPath();
    ctx.arc(x, y, radius, start, end);
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, start, start + Math.PI * 2 * (value / 100));
    ctx.stroke();

    ctx.fillStyle = theme.ink;
    ctx.font = `500 45px ${POSTER_SERIF}`;
    ctx.textAlign = "center";
    ctx.fillText(String(value), x, y + 15);

    ctx.fillStyle = "rgba(255, 247, 231, 0.65)";
    ctx.font = `400 18px ${POSTER_SANS}`;
    ctx.fillText(label, x, y + 91);
    ctx.restore();
  }

  function drawPosterPhoto(ctx, photo, theme) {
    const x = 190;
    const y = 245;
    const width = 700;
    const height = 590;

    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(540, 500, 440, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    posterArchPath(ctx, x, y, width, height);
    ctx.clip();
    ctx.fillStyle = theme.bg;
    ctx.fillRect(x, y, width, height);

    const sourceWidth = photo.width || photo.naturalWidth;
    const sourceHeight = photo.height || photo.naturalHeight;
    const scale = Math.max(width / sourceWidth, height / sourceHeight);
    const cropWidth = width / scale;
    const cropHeight = height / scale;
    const sourceX = (sourceWidth - cropWidth) / 2;
    const sourceY = (sourceHeight - cropHeight) / 2;
    ctx.drawImage(photo, sourceX, sourceY, cropWidth, cropHeight, x, y, width, height);

    const overlay = ctx.createLinearGradient(0, y + height * 0.45, 0, y + height);
    overlay.addColorStop(0, "rgba(12, 8, 22, 0)");
    overlay.addColorStop(1, "rgba(12, 8, 22, 0.56)");
    ctx.fillStyle = overlay;
    ctx.fillRect(x, y, width, height);
    ctx.restore();

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.accent;
    ctx.globalAlpha = 0.72;
    posterArchPath(ctx, x, y, width, height);
    ctx.stroke();
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    posterArchPath(ctx, x - 10, y - 10, width + 20, height + 20);
    ctx.stroke();

    ctx.globalAlpha = 0.72;
    ctx.fillStyle = "#fff7e8";
    ctx.font = `500 14px ${POSTER_SANS}`;
    drawPosterTracking(ctx, "YOUR LITTLE ORACLE", 236, 790, 3.2, "left");
    ctx.restore();
  }

  function drawPoster(ctx, photo, result) {
    const destiny = result.destiny;
    const theme = destiny.theme;
    const random = posterRandom(result.signature + destiny.id);
    const width = POSTER_WIDTH;
    const height = POSTER_HEIGHT;

    const background = ctx.createLinearGradient(0, 0, width * 0.75, height);
    background.addColorStop(0, theme.bg);
    background.addColorStop(0.48, theme.bg2);
    background.addColorStop(1, "#0b0714");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(540, 430, 20, 540, 430, 680);
    glow.addColorStop(0, theme.aura);
    glow.addColorStop(0.58, "rgba(255,255,255,0.015)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const bottomGlow = ctx.createRadialGradient(540, 1830, 20, 540, 1830, 550);
    bottomGlow.addColorStop(0, theme.aura);
    bottomGlow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(0, 1200, width, 720);
    ctx.globalAlpha = 1;

    drawPosterStars(ctx, theme, random);
    drawPosterMotif(ctx, theme, random);

    ctx.save();
    ctx.strokeStyle = theme.accent;
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = 1;
    posterRoundRect(ctx, 38, 38, width - 76, height - 76, 38);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = theme.accent;
    ctx.font = `600 17px ${POSTER_SANS}`;
    drawPosterTracking(ctx, "PAW ORACLE", 540, 82, 7.2, "center");

    ctx.fillStyle = theme.ink;
    ctx.textAlign = "center";
    ctx.font = `500 47px ${POSTER_SERIF}`;
    ctx.fillText("你家宠物是什么命？", 540, 143);

    ctx.fillStyle = "rgba(255, 248, 235, 0.46)";
    ctx.font = `400 19px ${POSTER_SANS}`;
    drawPosterTracking(ctx, "主宠缘分 · 娱乐报告", 540, 183, 2.6, "center");

    ctx.strokeStyle = theme.accent;
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.moveTo(400, 215);
    ctx.lineTo(520, 215);
    ctx.moveTo(560, 215);
    ctx.lineTo(680, 215);
    ctx.stroke();
    ctx.globalAlpha = 0.65;
    drawPosterSparkle(ctx, 540, 215, 7, theme.accent, 0.7);
    ctx.globalAlpha = 1;
    ctx.restore();

    drawPosterPhoto(ctx, photo, theme);

    ctx.save();
    ctx.fillStyle = theme.bg;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(853, 768, 59, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(853, 768, 48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = theme.accentSoft;
    ctx.font = `500 36px ${POSTER_SERIF}`;
    ctx.textAlign = "center";
    ctx.fillText(destiny.sigil, 853, 782);
    ctx.restore();

    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = theme.accent;
    ctx.font = `600 14px ${POSTER_SANS}`;
    drawPosterTracking(ctx, destiny.english, 540, 887, 3.8, "center");

    ctx.fillStyle = "rgba(255, 249, 236, 0.58)";
    ctx.font = `400 21px ${POSTER_SANS}`;
    ctx.fillText("检测完成 · 你家毛孩子的隐藏身份是", 540, 925);

    const nameGradient = ctx.createLinearGradient(300, 955, 780, 1035);
    nameGradient.addColorStop(0, "#fff9ec");
    nameGradient.addColorStop(0.52, theme.accentSoft);
    nameGradient.addColorStop(1, theme.accent);
    ctx.fillStyle = nameGradient;
    ctx.font = `600 96px ${POSTER_SERIF}`;
    ctx.fillText(destiny.name, 540, 1025);

    ctx.fillStyle = theme.accent;
    ctx.font = `500 26px ${POSTER_SERIF}`;
    ctx.fillText(destiny.title, 540, 1073);

    ctx.strokeStyle = theme.accent;
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(340, 1104);
    ctx.lineTo(500, 1104);
    ctx.moveTo(580, 1104);
    ctx.lineTo(740, 1104);
    ctx.stroke();
    ctx.globalAlpha = 0.64;
    drawPosterSparkle(ctx, 540, 1104, 6, theme.accent, 0.7);
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(255, 247, 233, 0.82)";
    ctx.textAlign = "center";
    ctx.font = `400 34px ${POSTER_SERIF}`;
    const quoteLines = wrapPosterText(ctx, destiny.quote, 790, 3);
    quoteLines.forEach((line, index) => {
      ctx.fillText(line, 540, 1152 + index * 51);
    });
    const quoteEnd = 1152 + (quoteLines.length - 1) * 51;
    const keywordY = Math.max(1280, quoteEnd + 45);

    ctx.fillStyle = theme.accent;
    ctx.font = `400 20px ${POSTER_SANS}`;
    drawPosterTracking(ctx, destiny.keywords.join("  ·  "), 540, keywordY, 1.2, "center");
    ctx.restore();

    const metricY = 1445;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 248, 235, 0.09)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(374, 1390);
    ctx.lineTo(374, 1532);
    ctx.moveTo(706, 1390);
    ctx.lineTo(706, 1532);
    ctx.stroke();
    ctx.restore();

    drawPosterMetricRing(ctx, 270, metricY, 54, result.indices.bond, theme.accentSoft, "主宠羁绊", theme);
    drawPosterMetricRing(ctx, 540, metricY, 54, result.indices.heal, "#d8c8e5", "治愈能量", theme);
    drawPosterMetricRing(ctx, 810, metricY, 54, result.indices.luck, "#efc0ad", "幸运象征", theme);

    ctx.save();
    ctx.fillStyle = "rgba(255, 248, 235, 0.29)";
    ctx.font = `400 14px ${POSTER_SANS}`;
    ctx.textAlign = "center";
    drawPosterTracking(ctx, "趣味指数 · 非科学心理测量", 540, 1586, 1.6, "center");

    ctx.strokeStyle = theme.accent;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(180, 1644);
    ctx.lineTo(900, 1644);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(255, 248, 235, 0.58)";
    ctx.font = `400 21px ${POSTER_SANS}`;
    ctx.fillText("把这张命格卡发给朋友，看看谁家的小祖宗最有福气。", 540, 1693);

    ctx.fillStyle = theme.ink;
    ctx.font = `600 30px ${POSTER_SERIF}`;
    ctx.fillText("宠缘签", 540, 1764);

    ctx.fillStyle = theme.accent;
    ctx.font = `600 12px ${POSTER_SANS}`;
    drawPosterTracking(ctx, "PAW ORACLE", 540, 1793, 4.2, "center");

    ctx.fillStyle = "rgba(255, 248, 235, 0.37)";
    ctx.font = `400 14px ${POSTER_SANS}`;
    ctx.fillText(`缘签编号  ${result.signature}`, 540, 1831);
    ctx.fillStyle = "rgba(255, 248, 235, 0.25)";
    ctx.font = `400 12px ${POSTER_SANS}`;
    ctx.fillText("娱乐向主宠缘分测试 · 不构成命运、财富或健康预测", 540, 1858);
    ctx.restore();
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve, reject) => {
      if (typeof canvas.toBlob === "function") {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("海报图片生成失败，请重试。"));
        }, "image/png");
        return;
      }
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const binary = atob(dataUrl.split(",")[1]);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index);
        }
        resolve(new Blob([bytes], { type: "image/png" }));
      } catch (error) {
        reject(new Error("当前浏览器无法导出海报，请更换浏览器重试。"));
      }
    });
  }

  async function buildPosterBlob() {
    if (!state.result || !state.photoSrc) {
      throw new Error("照片或报告信息不完整，请重新选择照片。");
    }
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (error) {
        console.warn("字体加载等待失败，继续绘制海报。", error);
      }
    }

    const photo = await loadImage(state.photoSrc);
    const canvas = document.createElement("canvas");
    canvas.width = POSTER_WIDTH;
    canvas.height = POSTER_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("当前浏览器无法创建 Canvas 海报。");
    drawPoster(context, photo, state.result);
    return canvasToBlob(canvas);
  }

  function showPosterImage() {
    const image = $("#poster-image");
    const loading = $("#poster-loading");
    image.src = state.posterUrl;
    image.alt = `${state.result.destiny.name}专属命格分享海报，可长按保存`;
    image.hidden = false;
    loading.hidden = true;
  }

  async function generatePoster() {
    if (!state.result) {
      showToast("缘签还没有生成，先完成前面的题目吧。");
      return;
    }
    openModal("poster-modal");
    if (state.posterBlob && state.posterUrl) {
      showPosterImage();
      return;
    }
    if (state.posterBusy) return;

    state.posterBusy = true;
    $("#poster-image").hidden = true;
    $("#poster-loading").hidden = false;
    const buttons = [$("#save-poster"), $("#share-poster")];
    buttons.forEach((button) => {
      button.disabled = true;
    });

    try {
      const blob = await buildPosterBlob();
      state.posterBlob = blob;
      if (state.posterUrl) URL.revokeObjectURL(state.posterUrl);
      state.posterUrl = URL.createObjectURL(blob);
      showPosterImage();
    } catch (error) {
      console.error(error);
      closeModal();
      showToast(error.message || "海报生成失败，请稍后再试。");
    } finally {
      state.posterBusy = false;
      buttons.forEach((button) => {
        button.disabled = false;
      });
    }
  }

  function posterFilename() {
    const name = state.result ? state.result.destiny.name : "我的毛孩子";
    const signature = state.result ? state.result.signature : "paw-oracle";
    return `宠缘签-${name}-${signature}.png`;
  }

  function downloadPoster(notify = true) {
    if (!state.posterBlob) {
      showToast("海报还没有生成完成，请稍等一下。");
      return false;
    }
    const url = state.posterUrl || URL.createObjectURL(state.posterBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = posterFilename();
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    if (notify) {
      showToast("已发起海报保存。若浏览器没有自动下载，可长按海报保存到相册。", 3800);
    }
    return true;
  }

  async function sharePoster() {
    if (!state.posterBlob || !state.result) {
      showToast("海报还没有生成完成，请稍等一下。");
      return;
    }
    const file = new File([state.posterBlob], posterFilename(), { type: "image/png" });
    const shareData = {
      title: state.result.destiny.shareTitle,
      text: state.result.destiny.shareText,
      files: [file],
    };

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
        console.warn("系统分享失败，转入保存回退。", error);
      }
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: state.result.destiny.shareTitle,
          text: state.result.destiny.shareText,
        });
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }

    downloadPoster(false);
    let copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(
          `${state.result.destiny.shareTitle}\n${state.result.destiny.shareText}`
        );
        copied = true;
      } catch (error) {
        copied = false;
      }
    }
    showToast(
      copied
        ? "当前浏览器不支持直接分享，已保存海报并复制分享文案。"
        : "当前浏览器不支持直接分享，已保存海报，可手动配文分享。",
      3800
    );
  }

  function init() {
    createStarfield();
    bindEvents();
    document.body.dataset.view = state.view;
  }

  init();
})();
