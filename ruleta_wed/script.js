
(() => {
  "use strict";

  const INITIAL_TRUTHS = [
    "¿Cuál es una habilidad que te gustaría aprender?",
    "¿Qué canción te sabes casi de memoria?",
    "¿Cuál ha sido uno de tus momentos más divertidos?",
    "¿Qué cualidad valoras más en una amistad?",
    "¿Cuál es una meta que te gustaría cumplir este año?"
  ];

  const INITIAL_DARES = [
    "Baila durante 15 segundos sin música.",
    "Imita a un personaje famoso durante 20 segundos.",
    "Inventa un saludo divertido para el grupo.",
    "Di tres cosas positivas de ti mismo.",
    "Intenta decir un trabalenguas sin equivocarte."
  ];

  const $ = id => document.getElementById(id);

  const canvas = $("wheel");
  const ctx = canvas.getContext("2d");
  const spinBtn = $("spinBtn");
  const status = $("status");
  const resultBox = $("resultBox");
  const truthList = $("truthList");
  const dareList = $("dareList");
  const notice = $("notice");
  const editDialog = $("editDialog");
  const editForm = $("editForm");
  const editInput = $("editInput");
  const languageSelect = $("languageSelect");

  let truths = [...INITIAL_TRUTHS];
  let dares = [...INITIAL_DARES];
  let rotation = 0;
  let spinning = false;
  let editing = null;
  let pageObjectUrl = null;
  let wheelObjectUrl = null;
  let wheelBaseColor = $("wheelColor").value;
  let language = "es";

  const WORDS = {
    es: {
      spin: "¡GIRAR LA RULETA!",
      spinning: "GIRANDO…",
      spinAgain: "GIRAR OTRA VEZ",
      ready: "Todo listo. Pulsa para girar.",
      spinningStatus: "La ruleta está girando…",
      truth: "VERDAD",
      dare: "RETO",
      resultTruth: "💬 VERDAD",
      resultDare: "⚡ RETO",
      truthStatus: "¡Salió VERDAD! Responde con sinceridad.",
      dareStatus: "¡Salió RETO! ¿Te atreves?",
      empty: "Añade al menos una verdad o un reto para jugar.",
      skip: "Pasar turno",
      resultTitle: "Tu resultado",
      resultSub: "La suerte tiene la palabra",
      subtitle: "Gira, descubre tu opción y ¡que empiece la diversión!",
      truths: "💬 Verdades",
      dares: "⚡ Retos",
      settings: "Opciones y apariencia",
      pageColor: "Fondo de la página",
      wheelColor: "Color de toda la ruleta",
      pageImage: "Imagen para la página",
      wheelImage: "Imagen para la ruleta",
      clearPage: "Quitar imagen de página",
      clearWheel: "Quitar imagen de ruleta",
      reset: "Restaurar valores iniciales",
      addTruth: "Escribe una verdad...",
      addDare: "Escribe un reto...",
      resultPlaceholder: "Tu verdad o reto aparecerá aquí.",
      friendly: "💜 Recuerda: todos pueden pasar un turno. ¡Lo importante es divertirse con respeto!",
      optionsHeading: "🎨 Fondos y colores",
      show: "Mostrar ajustes",
      hide: "Ocultar ajustes",
      emptyList: "No hay opciones. Añade una arriba."
    },

    en: {
      spin: "SPIN THE WHEEL!",
      spinning: "SPINNING…",
      spinAgain: "SPIN AGAIN",
      ready: "Ready! Press to spin.",
      spinningStatus: "The wheel is spinning…",
      truth: "TRUTH",
      dare: "DARE",
      resultTruth: "💬 TRUTH",
      resultDare: "⚡ DARE",
      truthStatus: "TRUTH! Answer honestly.",
      dareStatus: "DARE! Do you dare?",
      empty: "Add at least one truth or dare to play.",
      skip: "Skip turn",
      resultTitle: "Your result",
      resultSub: "Let luck decide",
      subtitle: "Spin, discover your option, and let the fun begin!",
      truths: "💬 Truths",
      dares: "⚡ Dares",
      settings: "Options and appearance",
      pageColor: "Page background",
      wheelColor: "Color of the whole wheel",
      pageImage: "Page image",
      wheelImage: "Wheel image",
      clearPage: "Remove page image",
      clearWheel: "Remove wheel image",
      reset: "Restore defaults",
      addTruth: "Write a truth...",
      addDare: "Write a dare...",
      resultPlaceholder: "Your truth or dare will appear here.",
      friendly: "💜 Remember: anyone can skip a turn. Have fun and respect each other!",
      optionsHeading: "🎨 Backgrounds and colors",
      show: "Show settings",
      hide: "Hide settings",
      emptyList: "No options. Add one above."
    }
  };

  function words() {
    return WORDS[language] || WORDS.es;
  }

  function announce(message) {
    notice.textContent = message;
    clearTimeout(announce.timer);
    announce.timer = setTimeout(() => {
      notice.textContent = "";
    }, 4000);
  }

  function applyLanguage() {
    const w = words();

    document.documentElement.lang = language;
    $("spinBtn").textContent = spinning ? w.spinning : w.spin;
    $("skipBtn").textContent = w.skip;
    $("status").textContent = spinning ? w.spinningStatus : w.ready;
    $("resultTitle").textContent = w.resultTitle;

    const resultSubtitle = document.querySelector(".card-heading p");
    if (resultSubtitle) resultSubtitle.textContent = w.resultSub;

    const subtitle = document.querySelector(".hero .subtitle");
    if (subtitle) subtitle.textContent = w.subtitle;

    $("truthTitle").textContent = w.truths;
    $("dareTitle").textContent = w.dares;
    $("settingsTitle").textContent = w.settings;

    const customizeTitle = document.querySelector(".customize h3");
    if (customizeTitle) customizeTitle.textContent = w.optionsHeading;

    const labels = document.querySelectorAll(".control-card");
    if (labels.length >= 4) {
      labels[0].childNodes[0].textContent = w.pageColor + " ";
      labels[1].childNodes[0].textContent = w.wheelColor + " ";
      labels[2].childNodes[0].textContent = w.pageImage + " ";
      labels[3].childNodes[0].textContent = w.wheelImage + " ";
    }

    $("clearPageImage").textContent = w.clearPage;
    $("clearWheelImage").textContent = w.clearWheel;
    $("resetBtn").textContent = w.reset;
    $("truthInput").placeholder = w.addTruth;
    $("dareInput").placeholder = w.addDare;

    const friendly = document.querySelector(".friendly-note");
    if (friendly) friendly.textContent = w.friendly;

    const toggle = $("toggleSettings");
    toggle.textContent = $("settingsContent").hidden ? w.show : w.hide;

    const placeholder = resultBox.querySelector(".result-placeholder");
    if (placeholder) placeholder.textContent = w.resultPlaceholder;

    drawWheel();
  }

  languageSelect.addEventListener("change", event => {
    language = event.target.value === "en" ? "en" : "es";
    applyLanguage();
  });

  function allOptions() {
    return [
      ...truths.map((text, index) => ({
        type: "truth",
        text,
        index
      })),
      ...dares.map((text, index) => ({
        type: "dare",
        text,
        index
      }))
    ];
  }

  function drawWheel() {
    const options = allOptions();
    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 12;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);

    if (!options.length) {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = wheelBaseColor;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = "bold 26px system-ui";
      ctx.fillText(language === "en" ? "Add options" : "Añade opciones", 0, 8);

      ctx.restore();
      return;
    }

    const slice = (Math.PI * 2) / options.length;

    options.forEach((option, index) => {
      const start = -Math.PI / 2 + rotation + index * slice;
      const end = start + slice;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();

      ctx.fillStyle = wheelBaseColor;
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";

      const fontSize =
        options.length > 14 ? 13 :
        options.length > 10 ? 15 : 17;

      ctx.font = `800 ${fontSize}px system-ui`;
      const label = option.type === "truth"
        ? words().truth
        : words().dare;

      ctx.shadowColor = "rgba(0,0,0,.22)";
      ctx.shadowBlur = 3;
      ctx.fillText(label, radius - 22, -4);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 7;
    ctx.stroke();

    ctx.restore();

    if (wheelObjectUrl) drawWheelImage();
  }

  function drawWheelImage() {
    const image = new Image();
    const url = wheelObjectUrl;

    image.onload = () => {
      if (url !== wheelObjectUrl) return;

      const size = canvas.width;
      const center = size / 2;
      const radius = size / 2 - 12;

      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 0.25;
      ctx.drawImage(image, 12, 12, size - 24, size - 24);
      ctx.restore();

      const options = allOptions();
      if (!options.length) return;

      const slice = Math.PI * 2 / options.length;

      options.forEach((option, index) => {
        const angle = -Math.PI / 2 + rotation + (index + 0.5) * slice;

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(angle);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.font = `800 ${options.length > 14 ? 13 : options.length > 10 ? 15 : 17}px system-ui`;
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 4;

        ctx.fillText(
          option.type === "truth" ? words().truth : words().dare,
          radius - 22,
          -4
        );

        ctx.restore();
      });
    };

    image.src = url;
  }

  function renderLists() {
    renderList(truthList, truths, "truth");
    renderList(dareList, dares, "dare");

    $("truthCount").textContent = String(truths.length);
    $("dareCount").textContent = String(dares.length);

    drawWheel();
  }

  function renderList(container, items, type) {
    container.replaceChildren();

    if (!items.length) {
      const li = document.createElement("li");
      li.className = "empty-list";
      li.textContent = words().emptyList;
      container.append(li);
      return;
    }

    items.forEach((text, index) => {
      const li = document.createElement("li");
      li.className = "option-item";

      const span = document.createElement("span");
      span.className = "option-text";
      span.textContent = text;

      const actions = document.createElement("div");
      actions.className = "item-actions";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "icon-btn";
      edit.textContent = "✏️";
      edit.setAttribute("aria-label", `Editar opción ${index + 1}`);
      edit.title = language === "en" ? "Edit" : "Editar";
      edit.addEventListener("click", () => openEdit(type, index));

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "icon-btn";
      remove.textContent = "✕";
      remove.setAttribute("aria-label", `Eliminar opción ${index + 1}`);
      remove.title = language === "en" ? "Delete" : "Eliminar";

      remove.addEventListener("click", () => {
        const target = type === "truth" ? truths : dares;
        target.splice(index, 1);
        renderLists();
        announce(language === "en" ? "Option deleted." : "Opción eliminada.");
      });

      actions.append(edit, remove);
      li.append(span, actions);
      container.append(li);
    });
  }

  function addOption(type, rawText) {
    const text = rawText.trim();

    if (!text) {
      announce(language === "en"
        ? "Write an option before adding it."
        : "Escribe una opción antes de añadirla.");
      return false;
    }

    const target = type === "truth" ? truths : dares;

    if (target.some(item => item.toLocaleLowerCase() === text.toLocaleLowerCase())) {
      announce(language === "en"
        ? "That option already exists in this list."
        : "Esa opción ya existe en esta lista.");
      return false;
    }

    target.push(text);
    renderLists();

    announce(language === "en" ? "Option added." : "Opción añadida.");
    return true;
  }

  $("truthForm").addEventListener("submit", event => {
    event.preventDefault();
    const input = $("truthInput");

    if (addOption("truth", input.value)) {
      input.value = "";
    }
  });

  $("dareForm").addEventListener("submit", event => {
    event.preventDefault();
    const input = $("dareInput");

    if (addOption("dare", input.value)) {
      input.value = "";
    }
  });

  function openEdit(type, index) {
    editing = { type, index };
    editInput.value = (type === "truth" ? truths : dares)[index];

    if (typeof editDialog.showModal === "function") {
      editDialog.showModal();
    } else {
      announce("Actualiza tu navegador para usar el editor.");
    }

    editInput.focus();
  }

  editForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!editing) return;

    const text = editInput.value.trim();

    if (!text) {
      announce(language === "en"
        ? "The text cannot be empty."
        : "El texto no puede quedar vacío.");
      editInput.focus();
      return;
    }

    const target = editing.type === "truth" ? truths : dares;

    if (target.some((item, i) =>
      i !== editing.index &&
      item.toLocaleLowerCase() === text.toLocaleLowerCase()
    )) {
      announce(language === "en"
        ? "An identical option already exists."
        : "Ya existe una opción igual en esta lista.");
      return;
    }

    target[editing.index] = text;
    editDialog.close();
    editing = null;

    renderLists();
    announce(language === "en" ? "Option updated." : "Opción actualizada.");
  });

  $("cancelEdit").addEventListener("click", () => {
    editDialog.close();
    editing = null;
  });

  function showResult(option) {
    resultBox.replaceChildren();

    const type = document.createElement("div");
    type.className = `result-type ${option.type === "truth" ? "truth-text" : "dare-text"}`;

    type.textContent = option.type === "truth"
      ? words().resultTruth
      : words().resultDare;

    const copy = document.createElement("p");
    copy.className = "result-copy";
    copy.textContent = option.text;

    resultBox.append(type, copy);
  }

  function spin() {
    const options = allOptions();

    if (spinning) return;

    if (!options.length) {
      status.textContent = words().empty;
      announce(words().empty);
      return;
    }

    spinning = true;
    spinBtn.disabled = true;
    spinBtn.textContent = words().spinning;
    $("skipBtn").disabled = true;
    status.textContent = words().spinningStatus;

    const selectedIndex = Math.floor(Math.random() * options.length);
    const slice = (Math.PI * 2) / options.length;

    const targetMod =
      (Math.PI * 2) - ((selectedIndex + 0.5) * slice);

    const currentMod =
      ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    const extraTurns = 5 + Math.floor(Math.random() * 3);

    const delta =
      extraTurns * Math.PI * 2 +
      ((targetMod - currentMod + Math.PI * 2) % (Math.PI * 2));

    const startRotation = rotation;
    const startTime = performance.now();

    const reducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const duration = reducedMotion ? 80 : 4200;

    function animate(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);

      rotation = startRotation + delta * eased;
      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        rotation = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

        drawWheel();
        showResult(options[selectedIndex]);

        status.textContent = options[selectedIndex].type === "truth"
          ? words().truthStatus
          : words().dareStatus;

        spinning = false;
        spinBtn.disabled = false;
        spinBtn.textContent = words().spinAgain;
        $("skipBtn").disabled = false;
      }
    }

    requestAnimationFrame(animate);
  }

  spinBtn.addEventListener("click", spin);

  $("skipBtn").addEventListener("click", () => {
    if (spinning) return;

    status.textContent = language === "en"
      ? "Turn skipped. Spin again when ready!"
      : "Turno pasado. ¡Puedes girar de nuevo cuando quieras!";

    announce(language === "en"
      ? "You can skip any turn."
      : "Puedes pasar cualquier turno sin penalización.");
  });

  $("toggleSettings").addEventListener("click", event => {
    const content = $("settingsContent");
    const hidden = content.hidden;

    content.hidden = !hidden;

    event.currentTarget.setAttribute("aria-expanded", String(hidden));
    event.currentTarget.textContent = hidden
      ? words().hide
      : words().show;
  });

  $("pageColor").addEventListener("input", event => {
    document.body.style.backgroundColor = event.target.value;
  });

  $("wheelColor").addEventListener("input", event => {
    wheelBaseColor = event.target.value;
    drawWheel();
  });

  function setImageBackground(input, kind) {
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        announce(language === "en"
          ? "Choose a valid image file."
          : "Selecciona un archivo de imagen válido.");
        input.value = "";
        return;
      }

      const url = URL.createObjectURL(file);

      if (kind === "page") {
        if (pageObjectUrl) URL.revokeObjectURL(pageObjectUrl);

        pageObjectUrl = url;

        document.body.style.backgroundImage =
          `linear-gradient(rgba(15,15,35,.70), rgba(15,15,35,.78)), url("${url}")`;

        document.body.style.backgroundColor = $("pageColor").value;
      } else {
        if (wheelObjectUrl) URL.revokeObjectURL(wheelObjectUrl);

        wheelObjectUrl = url;
        drawWheel();
      }

      announce(language === "en"
        ? "Background updated."
        : "Fondo actualizado.");
    });
  }

  setImageBackground($("pageImage"), "page");
  setImageBackground($("wheelImage"), "wheel");

  $("clearPageImage").addEventListener("click", () => {
    if (pageObjectUrl) URL.revokeObjectURL(pageObjectUrl);

    pageObjectUrl = null;
    $("pageImage").value = "";
    document.body.style.backgroundImage = "";
    document.body.style.backgroundColor = $("pageColor").value;

    announce(language === "en"
      ? "Page image removed."
      : "Imagen de página eliminada.");
  });

  $("clearWheelImage").addEventListener("click", () => {
    if (wheelObjectUrl) URL.revokeObjectURL(wheelObjectUrl);

    wheelObjectUrl = null;
    $("wheelImage").value = "";
    drawWheel();

    announce(language === "en"
      ? "Wheel image removed."
      : "Imagen de ruleta eliminada.");
  });

  $("resetBtn").addEventListener("click", () => {
    if (spinning) {
      announce(language === "en"
        ? "Wait for the wheel to stop before resetting."
        : "Espera a que la ruleta termine de girar.");
      return;
    }

    truths = [...INITIAL_TRUTHS];
    dares = [...INITIAL_DARES];

    $("pageColor").value = "#15152e";
    $("wheelColor").value = "#7667f5";
    wheelBaseColor = "#7667f5";

    document.body.style.backgroundColor = "#15152e";

    if (pageObjectUrl) URL.revokeObjectURL(pageObjectUrl);
    if (wheelObjectUrl) URL.revokeObjectURL(wheelObjectUrl);

    pageObjectUrl = null;
    wheelObjectUrl = null;

    document.body.style.backgroundImage = "";
    $("pageImage").value = "";
    $("wheelImage").value = "";

    resultBox.replaceChildren();

    const placeholder = document.createElement("span");
    placeholder.className = "result-placeholder";
    placeholder.textContent = words().resultPlaceholder;
    resultBox.append(placeholder);

    rotation = 0;
    spinBtn.disabled = false;
    $("skipBtn").disabled = false;
    spinBtn.textContent = words().spin;
    status.textContent = words().ready;

    renderLists();

    announce(language === "en"
      ? "Options and appearance restored."
      : "Opciones y apariencia restauradas.");
  });

  window.RuletaApp = Object.freeze({
    getOptions: () => ({
      truths: [...truths],
      dares: [...dares]
    }),
    addTruth: text => addOption("truth", text),
    addDare: text => addOption("dare", text),
    reset: () => $("resetBtn").click(),
    spin
  });

  renderLists();
  applyLanguage();
})();