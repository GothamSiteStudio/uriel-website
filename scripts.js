const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navBackdrop = document.querySelector(".nav-backdrop");
const navCloseButtons = document.querySelectorAll("[data-nav-close]");

if (navToggle && siteNav) {
  const navMedia = window.matchMedia("(max-width: 980px)");

  const updateNavA11y = () => {
    if (navMedia.matches) {
      siteNav.setAttribute("aria-hidden", String(!siteNav.classList.contains("is-open")));
    } else {
      siteNav.removeAttribute("aria-hidden");
      document.body.classList.remove("no-scroll");
      navBackdrop?.classList.remove("is-visible");
    }
  };

  const setNavState = (isOpen) => {
    siteNav.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("no-scroll", isOpen);
    navBackdrop?.classList.toggle("is-visible", isOpen);
    updateNavA11y();

    if (isOpen) {
      siteNav.querySelector("a")?.focus?.();
    }
  };

  navToggle.addEventListener("click", () => {
    setNavState(!siteNav.classList.contains("is-open"));
  });

  navCloseButtons.forEach((button) => {
    button.addEventListener("click", () => setNavState(false));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (siteNav.classList.contains("is-open")) {
        setNavState(false);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
      setNavState(false);
    }
  });

  if (navMedia.addEventListener) {
    navMedia.addEventListener("change", updateNavA11y);
  } else if (navMedia.addListener) {
    navMedia.addListener(updateNavA11y);
  }

  updateNavA11y();
}

document.querySelectorAll("i.fas, i.fa, i.far, i.fab").forEach((icon) => {
  icon.setAttribute("aria-hidden", "true");
});

const applyStoredAccessibilityModes = () => {
  const contrastEnabled = localStorage.getItem("a11y_contrast") === "true";
  const largeFontEnabled = localStorage.getItem("a11y_large_font") === "true";

  document.body.classList.toggle("a11y-contrast", contrastEnabled);
  document.body.classList.toggle("a11y-large-font", largeFontEnabled);

  document
    .querySelectorAll("[data-a11y-toggle='contrast']")
    .forEach((button) => button.setAttribute("aria-pressed", String(contrastEnabled)));
  document
    .querySelectorAll("[data-a11y-toggle='font']")
    .forEach((button) => button.setAttribute("aria-pressed", String(largeFontEnabled)));
};

applyStoredAccessibilityModes();

document.querySelectorAll("[data-a11y-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.getAttribute("data-a11y-toggle");
    if (type === "contrast") {
      const next = !document.body.classList.contains("a11y-contrast");
      document.body.classList.toggle("a11y-contrast", next);
      localStorage.setItem("a11y_contrast", String(next));
    }
    if (type === "font") {
      const next = !document.body.classList.contains("a11y-large-font");
      document.body.classList.toggle("a11y-large-font", next);
      localStorage.setItem("a11y_large_font", String(next));
    }
    applyStoredAccessibilityModes();
  });
});

const cookieBanner = document.querySelector("[data-cookie-banner]");
const cookieConsentKey = "cookie_consent";

const runDeferredAnalyticsScripts = () => {
  document
    .querySelectorAll('script[type="text/plain"][data-cookie-consent="analytics"]')
    .forEach((script) => {
      const replacement = document.createElement("script");
      Array.from(script.attributes).forEach((attr) => {
        if (attr.name !== "type") {
          replacement.setAttribute(attr.name, attr.value);
        }
      });
      replacement.text = script.textContent || "";
      script.parentNode?.replaceChild(replacement, script);
    });
};

const applyCookieConsent = (value) => {
  localStorage.setItem(cookieConsentKey, value);
  if (cookieBanner) cookieBanner.hidden = true;
  if (value === "accepted") {
    runDeferredAnalyticsScripts();
  }
};

if (cookieBanner) {
  const storedConsent = localStorage.getItem(cookieConsentKey);
  if (!storedConsent) {
    cookieBanner.hidden = false;
  } else if (storedConsent === "accepted") {
    runDeferredAnalyticsScripts();
  }

  cookieBanner.querySelectorAll("[data-cookie-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-cookie-action");
      if (action === "accept") applyCookieConsent("accepted");
      if (action === "reject") applyCookieConsent("rejected");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");
if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

document.querySelectorAll("[data-lead-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = form.querySelector(".form-note");
    if (note) {
      note.textContent = "תודה! נחזור אליכם תוך יום עסקים.";
    }
    form.reset();
  });
});

const popup = document.getElementById("lead-popup");
const popupKey = "yohnanovPopupSeen";

if (popup) {
  const dialog = popup.querySelector("[role='dialog']");
  const closeButton = popup.querySelector("[data-popup-close]");
  const popupTriggers = document.querySelectorAll("[data-popup-trigger]");
  const pageRegions = [
    document.querySelector(".top-strip"),
    document.querySelector(".site-header"),
    document.querySelector("main"),
    document.querySelector(".site-footer"),
    document.querySelector(".floating-bar"),
  ].filter(Boolean);
  let lastFocusedElement = null;

  const setPageInert = (isInert) => {
    pageRegions.forEach((region) => {
      if (isInert) {
        region.setAttribute("aria-hidden", "true");
        region.setAttribute("inert", "");
      } else {
        region.removeAttribute("aria-hidden");
        region.removeAttribute("inert");
      }
    });
  };

  const getFocusableElements = () => {
    const root = dialog || popup;
    return Array.from(
      root.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.offsetParent !== null);
  };

  const openPopup = () => {
    if (popup.classList.contains("is-visible")) return;
    lastFocusedElement = document.activeElement;
    popup.classList.add("is-visible");
    popup.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    setPageInert(true);

    setTimeout(() => {
      (closeButton || getFocusableElements()[0])?.focus?.();
    }, 0);
  };

  const closePopup = () => {
    popup.classList.remove("is-visible");
    popup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    setPageInert(false);
    sessionStorage.setItem(popupKey, "true");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  };

  popupTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      if (event.currentTarget.tagName === "A") {
        event.preventDefault();
      }
      openPopup();
    });
  });

  popup.querySelectorAll("[data-popup-close]").forEach((element) => {
    element.addEventListener("click", closePopup);
  });

  document.addEventListener("keydown", (event) => {
    if (!popup.classList.contains("is-visible")) return;

    if (event.key === "Escape") {
      closePopup();
      return;
    }

    if (event.key === "Tab") {
      const focusable = getFocusableElements();
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
  });
}

const initMortgageCalculator = () => {
  const tracksList = document.getElementById("tracks-list");
  if (!tracksList) return;
  const addTrackButton = document.getElementById("add-track");

  const trackTypeLabels = {
    "fixed-unlinked": "קבועה לא צמודה",
    "fixed-linked": "קבועה צמודה מדד",
    prime: "פריים",
    "variable-1-linked": "משתנה כל שנה צמודה מדד",
    "variable-1-unlinked": "משתנה כל שנה לא צמודה",
    "variable-2-linked": "משתנה כל שנתיים צמודה מדד",
    "variable-2-unlinked": "משתנה כל שנתיים לא צמודה",
    "variable-3-linked": "משתנה כל 3 שנים צמודה מדד",
    "variable-3-unlinked": "משתנה כל 3 שנים לא צמודה",
    "variable-5-linked": "משתנה כל 5 שנים צמודה מדד",
    "variable-5-unlinked": "משתנה כל 5 שנים לא צמודה",
    "variable-7-linked": "משתנה כל 7 שנים צמודה מדד",
    "variable-7-unlinked": "משתנה כל 7 שנים לא צמודה",
    "variable-10-linked": "משתנה כל 10 שנים צמודה מדד",
    "variable-10-unlinked": "משתנה כל 10 שנים לא צמודה",
    bridge: "בוליט / גישור",
  };

  const defaultTracks = [
    {
      name: "אפשרות 1",
      trackType: "fixed-unlinked",
      amount: 500000,
      interest: 5.3,
      years: 25,
      madad: 0,
      repayment: "shpitzer",
    },
  ];

  const refreshAutoNames = () => {
    const cards = Array.from(document.querySelectorAll(".track-card"));
    cards.forEach((card, index) => {
      const input = card.querySelector(".track-name");
      if (input?.dataset?.autoName === "true") {
        input.value = `אפשרות ${index + 1}`;
      }
    });
  };

  const addTrack = (prefill = {}) => {
    const defaults = {
      name: "",
      trackType: "fixed-unlinked",
      amount: "",
      interest: "",
      years: "",
      madad: 0,
      repayment: "shpitzer",
      rateChangeMonths: "",
      rateChangeRate: "",
    };

    const data = { ...defaults, ...prefill };
    const isAutoName = !data.name;
    if (isAutoName) {
      data.name = `אפשרות ${tracksList.children.length + 1}`;
    }
    const card = document.createElement("article");
    card.className = "track-card";
    const uid = `track-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const ids = {
      name: `${uid}-name`,
      type: `${uid}-type`,
      amount: `${uid}-amount`,
      interest: `${uid}-interest`,
      years: `${uid}-years`,
      repayment: `${uid}-repayment`,
      madad: `${uid}-madad`,
      madadHelp: `${uid}-madad-help`,
      rateMonths: `${uid}-rate-months`,
      rateMonthsHelp: `${uid}-rate-months-help`,
      rateRate: `${uid}-rate-rate`,
    };
    card.innerHTML = `
      <header class="track-card-header">
        <div>
          <label class="field-label" for="${ids.name}">שם המסלול</label>
          <input id="${ids.name}" type="text" class="track-name" placeholder="לדוגמה: אפשרות 1" value="${data.name || ""}" data-auto-name="${isAutoName ? "true" : "false"}">
        </div>
        <button type="button" class="track-remove" aria-label="הסרת מסלול">
          <i class="fas fa-trash"></i> הסר
        </button>
      </header>
      <div class="fields-grid">
        <div class="field">
          <label for="${ids.type}">סוג מסלול</label>
          <select id="${ids.type}" class="track-type">
            ${Object.entries(trackTypeLabels)
              .map(
                ([value, label]) =>
                  `<option value="${value}" ${value === data.trackType ? "selected" : ""}>${label}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="field">
          <label for="${ids.amount}">סכום המסלול (₪)</label>
          <input id="${ids.amount}" type="text" class="amount" inputmode="decimal" value="${formatInputNumber(data.amount)}">
        </div>
        <div class="field">
          <label for="${ids.interest}">ריבית שנתית (%)</label>
          <input id="${ids.interest}" type="number" class="interest" min="0" step="0.01" inputmode="decimal" value="${data.interest}">
        </div>
        <div class="field">
          <label for="${ids.years}">תקופה (שנים)</label>
          <input id="${ids.years}" type="number" class="years" min="1" max="35" step="0.5" inputmode="decimal" value="${data.years}">
        </div>
        <div class="field">
          <label for="${ids.repayment}">שיטת החזר</label>
          <select id="${ids.repayment}" class="repayment">
            <option value="shpitzer" ${data.repayment === "shpitzer" ? "selected" : ""}>שפיצר (תשלום קבוע)</option>
            <option value="keren" ${data.repayment === "keren" ? "selected" : ""}>קרן שווה (תשלום יורד)</option>
            <option value="bullet" ${data.repayment === "bullet" ? "selected" : ""}>בוליט / בלון</option>
          </select>
        </div>
        <div class="field">
          <label for="${ids.madad}">מדד שנתי ממוצע (%)</label>
          <input id="${ids.madad}" type="number" class="madad" min="0" step="0.1" inputmode="decimal" value="${data.madad}" aria-describedby="${ids.madadHelp}">
          <small id="${ids.madadHelp}">0 משמע לא צמוד</small>
        </div>
      </div>
      <details class="advanced">
        <summary><i class="fas fa-sliders" aria-hidden="true"></i> הגדרות מתקדמות</summary>
        <div class="advanced-grid">
          <div class="field">
            <label for="${ids.rateMonths}">שינוי ריבית אחרי (חודשים)</label>
            <input id="${ids.rateMonths}" type="number" class="rate-change-months" min="1" step="1" inputmode="numeric" value="${data.rateChangeMonths}" aria-describedby="${ids.rateMonthsHelp}">
            <small id="${ids.rateMonthsHelp}">השאירו ריק אם אין שינוי</small>
          </div>
          <div class="field">
            <label for="${ids.rateRate}">ריבית חדשה (%)</label>
            <input id="${ids.rateRate}" type="number" class="rate-change-rate" min="0" step="0.01" inputmode="decimal" value="${data.rateChangeRate}">
          </div>
        </div>
      </details>
    `;
    tracksList.appendChild(card);
    const amountInput = card.querySelector(".amount");
    attachNumberFormatting(amountInput);
    const removeButton = card.querySelector(".track-remove");
    removeButton.addEventListener("click", () => {
      card.remove();
      refreshAutoNames();
    });
    const nameInput = card.querySelector(".track-name");
    nameInput.addEventListener("input", () => {
      nameInput.dataset.autoName = "false";
    });
    nameInput.addEventListener("blur", () => {
      if (!nameInput.value.trim()) {
        nameInput.dataset.autoName = "true";
        refreshAutoNames();
      }
    });
  };

  const collectTracks = () => {
    const cards = document.querySelectorAll(".track-card");
    const tracks = [];
    cards.forEach((card, idx) => {
      const amount = parseNumber(card.querySelector(".amount").value);
      const interest = parseFloat(card.querySelector(".interest").value);
      const years = parseFloat(card.querySelector(".years").value);
      const madad = parseFloat(card.querySelector(".madad").value) || 0;
      const repayment = card.querySelector(".repayment").value;
      const trackType = card.querySelector(".track-type").value;
      const nameInput = card.querySelector(".track-name").value.trim();
      const name = nameInput || `אפשרות ${idx + 1}`;
      const rateChangeMonths = parseInt(card.querySelector(".rate-change-months").value, 10);
      const rateChangeRate = parseFloat(card.querySelector(".rate-change-rate").value);

      tracks.push({
        name,
        trackType,
        amount,
        interest,
        years,
        madad,
        repayment,
        rateChangeMonths: Number.isFinite(rateChangeMonths) ? rateChangeMonths : null,
        rateChangeRate: Number.isFinite(rateChangeRate) ? rateChangeRate : null,
      });
    });
    return tracks;
  };

  const buildComplianceWarnings = (tracks, totalPrincipal) => {
    if (!totalPrincipal) return ["לא הוזן סכום כולל לתמהיל."];
    const variableTypes = [
      "prime",
      "variable-1-linked",
      "variable-1-unlinked",
      "variable-2-linked",
      "variable-2-unlinked",
      "variable-3-linked",
      "variable-3-unlinked",
      "variable-5-linked",
      "variable-5-unlinked",
    ];
    const fixedTypes = ["fixed-unlinked", "fixed-linked"];

    const variableSum = tracks
      .filter((track) => variableTypes.includes(track.trackType))
      .reduce((acc, track) => acc + (track.amount || 0), 0);

    const fixedSum = tracks
      .filter((track) => fixedTypes.includes(track.trackType))
      .reduce((acc, track) => acc + (track.amount || 0), 0);

    const warnings = [];
    if (variableSum / totalPrincipal > 0.33) {
      warnings.push(
        "אזהרה: יותר משליש מהתמהיל בריבית משתנה קצרה (פריים/משתנה ≤5). לפי הוראות בנק ישראל יש להגביל זאת ל-33%."
      );
    }
    if (fixedSum / totalPrincipal < 0.33) {
      warnings.push("אזהרה: לפחות שליש מהמשכנתא חייב להיות בריבית קבועה לפי הוראות בנק ישראל.");
    }
    return warnings;
  };

  const calculateTrack = (track) => {
    const months = Math.round(track.years * 12);
    let currentPrincipal = track.amount;
    const monthlyMadadRate = (track.madad || 0) / 100 / 12;
    let currentAnnualRate = track.interest / 100;

    const schedule = [];
    let totalPaid = 0;
    let totalInterest = 0;
    let totalInflation = 0;
    let firstPayment = 0;
    let maxPayment = 0;

    const basePrincipalPart = track.amount / months;

    for (let m = 1; m <= months; m += 1) {
      const prevPrincipal = currentPrincipal;
      if (monthlyMadadRate > 0) {
        currentPrincipal *= 1 + monthlyMadadRate;
        totalInflation += currentPrincipal - prevPrincipal;
      }

      if (track.rateChangeMonths && track.rateChangeRate && m > track.rateChangeMonths) {
        currentAnnualRate = track.rateChangeRate / 100;
      }

      const monthlyRate = currentAnnualRate / 12;
      let interestPayment = currentPrincipal * monthlyRate;
      let principalPayment = 0;
      let payment = 0;

      if (track.repayment === "shpitzer") {
        const remainingMonths = months - m + 1;
        if (monthlyRate === 0) {
          payment = currentPrincipal / remainingMonths;
        } else {
          const pow = Math.pow(1 + monthlyRate, remainingMonths);
          payment = (currentPrincipal * (monthlyRate * pow)) / (pow - 1);
        }
        principalPayment = payment - interestPayment;
      } else if (track.repayment === "keren") {
        principalPayment = basePrincipalPart;
        if (m === months || principalPayment > currentPrincipal) {
          principalPayment = currentPrincipal;
        }
        payment = principalPayment + interestPayment;
      } else {
        payment = interestPayment;
        if (m === months) {
          principalPayment = currentPrincipal;
          payment += principalPayment;
        }
      }

      currentPrincipal -= principalPayment;
      if (currentPrincipal < 0) currentPrincipal = 0;

      if (m === 1) firstPayment = payment;
      if (payment > maxPayment) maxPayment = payment;

      totalPaid += payment;
      totalInterest += interestPayment;

      schedule.push({
        month: m,
        payment,
        principalPayment,
        interestPayment,
        balance: currentPrincipal,
      });
    }

    return {
      firstPayment,
      maxPayment,
      totalPaid,
      totalInterest,
      totalInflation,
      schedule,
    };
  };

  const renderSummary = (totals) => {
    document.getElementById("first-payment").innerText = formatMoney(totals.firstPayment);
    document.getElementById("max-payment").innerText = formatMoney(totals.maxPayment);
    document.getElementById("total-payment").innerText = formatMoney(totals.totalPaid);
    document.getElementById("total-interest").innerText = formatMoney(totals.totalInterest);
    document.getElementById("total-inflation").innerText = formatMoney(totals.totalInflation);
  };

  const repaymentLabel = (value) => {
    if (value === "keren") return "קרן שווה";
    if (value === "bullet") return "בוליט / בלון";
    return "שפיצר";
  };

  const buildScheduleTable = (schedule) => {
    const rows = schedule
      .map(
        (item) => `
          <tr>
            <td>${item.month}</td>
            <td>${formatMoney(item.payment)}</td>
            <td>${formatMoney(item.principalPayment)}</td>
            <td>${formatMoney(item.interestPayment)}</td>
            <td>${formatMoney(item.balance)}</td>
          </tr>
        `
      )
      .join("");

    return `
      <div class="table-wrapper">
        <table class="schedule-table">
          <caption class="sr-only">לוח סילוקין חודשי</caption>
          <thead>
            <tr>
              <th scope="col">חודש</th>
              <th scope="col">תשלום חודשי</th>
              <th scope="col">חלק קרן</th>
              <th scope="col">חלק ריבית</th>
              <th scope="col">יתרה בסוף חודש</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  };

  const renderTrackResults = (results) => {
    const container = document.getElementById("tracks-results");
    container.innerHTML = "";
    results.forEach((result, idx) => {
      const card = document.createElement("article");
      card.className = "track-result-card";
      card.innerHTML = `
        <header class="track-result-header">
          <div>
            <p class="eyebrow">מסלול ${idx + 1}</p>
            <h4>${result.name}</h4>
            <p class="muted">${trackTypeLabels[result.trackType]} • ${repaymentLabel(result.repayment)}</p>
          </div>
          <div class="pill">${result.years} שנים</div>
        </header>
        <div class="track-result-grid">
          <div>
            <span class="label">החזר ראשון</span>
            <strong>${formatMoney(result.firstPayment)}</strong>
          </div>
          <div>
            <span class="label">החזר מקסימלי</span>
            <strong>${formatMoney(result.maxPayment)}</strong>
          </div>
          <div>
            <span class="label">סה״כ תשלומים</span>
            <strong>${formatMoney(result.totalPaid)}</strong>
          </div>
          <div>
            <span class="label">סה״כ ריבית</span>
            <strong>${formatMoney(result.totalInterest)}</strong>
          </div>
          <div>
            <span class="label">תוספת מדד</span>
            <strong>${formatMoney(result.totalInflation)}</strong>
          </div>
        </div>
        <details>
          <summary><i class="fas fa-table" aria-hidden="true"></i> לוח סילוקין מלא</summary>
          ${buildScheduleTable(result.schedule)}
        </details>
      `;
      container.appendChild(card);
    });
  };

  const showMessages = ({ errors = [], warnings = [] }) => {
    const messagesEl = document.getElementById("calc-messages");
    const complianceEl = document.getElementById("compliance-note");
    messagesEl.innerHTML = "";
    complianceEl.innerHTML = "";

    if (!errors.length && !warnings.length) return;

    if (errors.length) {
      const list = errors.map((err) => `<li>${err}</li>`).join("");
      messagesEl.innerHTML = `
        <div class="message error">
          <i class="fas fa-circle-exclamation" aria-hidden="true"></i>
          <div><strong>שגיאות קלט:</strong><ul>${list}</ul></div>
        </div>
      `;
    }

    if (warnings.length) {
      const list = warnings.map((warning) => `<li>${warning}</li>`).join("");
      complianceEl.innerHTML = `
        <div class="message warning">
          <i class="fas fa-triangle-exclamation" aria-hidden="true"></i>
          <div><strong>אזהרות משכנתא:</strong><ul>${list}</ul></div>
        </div>
      `;
    }
  };

  const formatMoney = (num) => {
    if (!Number.isFinite(num)) return "₪0";
    return `₪${Math.round(num).toLocaleString("he-IL")}`;
  };

  const formatInputNumber = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "";
    return num.toLocaleString("en-US");
  };

  const parseNumber = (value) => {
    if (typeof value !== "string") return Number(value);
    const cleaned = value.replace(/,/g, "").trim();
    return Number(cleaned);
  };

  const attachNumberFormatting = (input) => {
    if (!input) return;
    input.addEventListener("focus", () => {
      input.value = input.value.replace(/,/g, "");
    });
    input.addEventListener("blur", () => {
      input.value = formatInputNumber(input.value);
    });
  };

  const calculateAll = () => {
    const tracks = collectTracks();
    const messages = { errors: [], warnings: [] };
    const totals = {
      firstPayment: 0,
      maxPayment: 0,
      totalPaid: 0,
      totalInterest: 0,
      totalInflation: 0,
      totalPrincipal: 0,
    };

    tracks.forEach((track, idx) => {
      if (!track.amount || track.amount <= 0) messages.errors.push(`סכום לא תקין במסלול ${idx + 1}.`);
      if (!track.interest && track.interest !== 0) messages.errors.push(`ריבית חסרה במסלול ${idx + 1}.`);
      if (!track.years || track.years <= 0) messages.errors.push(`תקופה לא תקינה במסלול ${idx + 1}.`);
    });

    if (messages.errors.length) {
      showMessages(messages);
      return;
    }

    const results = tracks.map((track) => {
      const calc = calculateTrack(track);
      totals.firstPayment += calc.firstPayment;
      totals.maxPayment += calc.maxPayment;
      totals.totalPaid += calc.totalPaid;
      totals.totalInterest += calc.totalInterest;
      totals.totalInflation += calc.totalInflation;
      totals.totalPrincipal += track.amount;
      return { ...track, ...calc };
    });

    const complianceWarnings = buildComplianceWarnings(tracks, totals.totalPrincipal);
    messages.warnings.push(...complianceWarnings);

    showMessages(messages);
    renderSummary(totals);
    renderTrackResults(results);

    const resultsArea = document.getElementById("results-area");
    resultsArea.style.display = "block";
    resultsArea.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const seedTracks = () => {
    if (tracksList.children.length === 0) {
      defaultTracks.forEach(addTrack);
    }
  };

  window.calculateAll = calculateAll;
  if (addTrackButton) {
    addTrackButton.addEventListener("click", () => addTrack());
  }
  seedTracks();
};

initMortgageCalculator();
