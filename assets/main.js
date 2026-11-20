// ========================================
// HELPER UTILITAS GLOBAL
// ========================================
function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeJsonParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function showBeasifyToast(message, delay = 2200) {
  const toastEl = document.getElementById("actionToast");
  const toastBody = document.getElementById("actionToastBody");
  if (!toastEl || !toastBody || typeof bootstrap === "undefined") return;

  toastBody.textContent = message;
  bootstrap.Toast.getOrCreateInstance(toastEl, { delay }).show();
}

// ========================================
// DETEKSI ALUR (SOBAT BEASIFY VS MITRA)
// ========================================
function hasMitraContext() {
  const path = (window.location.pathname || "").toLowerCase();
  const hasMitraDom = Boolean(
    document.getElementById("sidebarAlurMitra") ||
    document.getElementById("mitraDashboardView") ||
    document.getElementById("mitraFormView") ||
    document.getElementById("mitraLoginForm") ||
    document.getElementById("mitraProfilForm") ||
    document.querySelector(".hamburger-alur-mitra") ||
    document.querySelector('[data-bs-target="#sidebarAlurMitra"]') ||
    document.querySelector('[aria-controls="sidebarAlurMitra"]'),
  );

  const isMitraPage =
    path.includes("dashboard-mitra") ||
    path.includes("profile-mitra") ||
    path.includes("profil-mitra") ||
    path.includes("login-mitra");

  if (hasMitraDom || isMitraPage) return true;

  const rawSession = safeJsonParse(
    localStorage.getItem("beasify_mitra_session"),
    null,
  );
  return Boolean(rawSession && rawSession.role === "mitra");
}

// ========================================
// STICKY HEADER & FLOATING SEARCH BAR
// ========================================
function initStickyHeader() {
  const headerEl = document.querySelector(".header-nav-bg");
  if (!headerEl) return;

  headerEl.style.position = "sticky";
  headerEl.style.top = "0";
  headerEl.style.zIndex = "1030";
  headerEl.style.backgroundColor = "var(--primary-color, #efefe2)";
  headerEl.style.boxShadow = "0 2px 10px rgba(4, 36, 74, 0.06)";
}

function initFloatingSearchSection() {
  const searchSection = document.querySelector(".search-section");
  const isBeranda = Boolean(document.getElementById("scholarshipList"));
  if (!searchSection || !isBeranda) return;

  const headerEl = document.querySelector(".header-nav-bg");

  function syncFloatingPosition() {
    const headerHeight = headerEl ? headerEl.offsetHeight : 64;
    searchSection.style.position = "sticky";
    searchSection.style.top = `${headerHeight + 8}px`;
    searchSection.style.zIndex = "1020";
    searchSection.style.margin = "14px 0 20px";
    searchSection.style.padding = "10px 0";
    searchSection.style.backgroundColor = "rgba(239, 239, 226, 0.88)";
    searchSection.style.backdropFilter = "blur(10px)";
    searchSection.style.webkitBackdropFilter = "blur(10px)";
    searchSection.style.borderRadius = "24px";
    searchSection.style.boxShadow = "0 8px 24px rgba(4, 36, 74, 0.08)";
  }

  function syncScrollShadow() {
    const isScrolled = window.scrollY > 12;
    searchSection.style.boxShadow = isScrolled
      ? "0 10px 26px rgba(4, 36, 74, 0.12)"
      : "0 6px 18px rgba(4, 36, 74, 0.06)";
  }

  syncFloatingPosition();
  syncScrollShadow();

  window.addEventListener("resize", syncFloatingPosition);
  window.addEventListener("scroll", syncScrollShadow, { passive: true });
}

// ========================================
// HAMBURGER OFFCANVAS TERPISAH (SOBAT & MITRA)
// ========================================
function initSidebarHamburgerSobat() {
  if (typeof bootstrap === "undefined") return;

  const sobatButtons = document.querySelectorAll(
    '.custom-hamburger:not(.hamburger-alur-mitra):not([data-bs-target="#sidebarAlurMitra"]):not([aria-controls="sidebarAlurMitra"])',
  );

  sobatButtons.forEach(function (hamburgerBtn) {
    const targetSelector =
      hamburgerBtn.getAttribute("data-bs-target") ||
      hamburgerBtn.getAttribute("aria-controls");
    const sidebarEl = targetSelector
      ? document.querySelector(
          targetSelector.startsWith("#")
            ? targetSelector
            : `#${targetSelector}`,
        )
      : document.getElementById("sidebarMenu");

    if (!sidebarEl) return;

    hamburgerBtn.addEventListener("click", function (event) {
      const instance = bootstrap.Offcanvas.getOrCreateInstance(sidebarEl);
      if (!sidebarEl.classList.contains("show")) {
        event.preventDefault();
        instance.show();
      }
    });
  });
}

function initSidebarHamburgerMitra() {
  if (typeof bootstrap === "undefined") return;

  const mitraButtons = document.querySelectorAll(
    '.custom-hamburger.hamburger-alur-mitra, .custom-hamburger[data-bs-target="#sidebarAlurMitra"], .custom-hamburger[aria-controls="sidebarAlurMitra"]',
  );

  mitraButtons.forEach(function (hamburgerBtn) {
    const targetSelector =
      hamburgerBtn.getAttribute("data-bs-target") ||
      hamburgerBtn.getAttribute("aria-controls") ||
      "#sidebarAlurMitra";
    const sidebarEl = document.querySelector(
      targetSelector.startsWith("#") ? targetSelector : `#${targetSelector}`,
    );

    if (!sidebarEl) return;

    hamburgerBtn.addEventListener("click", function (event) {
      const instance = bootstrap.Offcanvas.getOrCreateInstance(sidebarEl);
      if (!sidebarEl.classList.contains("show")) {
        event.preventDefault();
        instance.show();
      }
    });
  });
}

// ========================================
// PENCARIAN & FILTER BEASISWA (BERANDA)
// ========================================
function initScholarshipFilter() {
  if (document.getElementById("bookmarkListContainer")) return;

  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const filterLevel = document.getElementById("filterLevel");
  const filterFunding = document.getElementById("filterFunding");
  const applyFilter = document.getElementById("applyFilter");
  const resetFilterModal = document.getElementById("resetFilterModal");
  const resetAllEmpty = document.getElementById("resetAllEmpty");
  const emptyState = document.getElementById("emptyState");
  const emptyStateMessage = document.getElementById("emptyStateMessage");

  const scholarshipItems = document.querySelectorAll(".scholarship-item");
  if (!scholarshipItems.length) return;

  function updateEmptyState(
    visibleCount,
    keyword,
    selectedLevel,
    selectedFunding,
  ) {
    if (!emptyState) return;

    if (visibleCount === 0) {
      emptyState.classList.remove("d-none");

      if (emptyStateMessage) {
        const activeFilters = [];
        if (keyword) activeFilters.push(`kata kunci "${keyword}"`);
        if (selectedLevel) activeFilters.push(`jenjang ${selectedLevel}`);
        if (selectedFunding) activeFilters.push(`pendanaan ${selectedFunding}`);

        emptyStateMessage.textContent = activeFilters.length
          ? `Tidak ada beasiswa yang cocok dengan ${activeFilters.join(" dan ")}. Coba ubah kata kunci atau reset filter.`
          : "Belum ada data beasiswa yang tersedia saat ini.";
      }
    } else {
      emptyState.classList.add("d-none");
    }
  }

  function applyAllFilters() {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedLevel = filterLevel ? filterLevel.value : "";
    const selectedFunding = filterFunding ? filterFunding.value : "";

    let visibleCount = 0;

    scholarshipItems.forEach(function (item) {
      const card = item.querySelector(".scholarship-card");
      if (!card) {
        item.classList.add("d-none");
        return;
      }

      const title = (
        card.querySelector(".card-title")?.textContent || ""
      ).toLowerCase();
      const org = (
        card.querySelector(".card-text")?.textContent || ""
      ).toLowerCase();
      const levelText = (
        card.querySelector(".scholarship-level")?.textContent || ""
      ).toLowerCase();
      const rawLevel = card.dataset.level || "";
      const funding = card.dataset.funding || "";

      const levels = rawLevel
        .split(",")
        .map((lvl) => lvl.trim())
        .filter(Boolean);

      const matchKeyword =
        !keyword ||
        title.includes(keyword) ||
        org.includes(keyword) ||
        levelText.includes(keyword) ||
        funding.toLowerCase().includes(keyword);

      const matchLevel = !selectedLevel || levels.includes(selectedLevel);
      const matchFunding = !selectedFunding || funding === selectedFunding;

      const isMatch = matchKeyword && matchLevel && matchFunding;
      item.classList.toggle("d-none", !isMatch);

      if (isMatch) {
        visibleCount += 1;
      }
    });

    updateEmptyState(visibleCount, keyword, selectedLevel, selectedFunding);
  }

  function resetAllFilters() {
    if (filterLevel) filterLevel.value = "";
    if (filterFunding) filterFunding.value = "";
    if (searchInput) searchInput.value = "";
    applyAllFilters();
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyAllFilters);
    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        applyAllFilters();
      }
    });
  }

  if (searchButton) searchButton.addEventListener("click", applyAllFilters);
  if (applyFilter) applyFilter.addEventListener("click", applyAllFilters);
  if (resetFilterModal) {
    resetFilterModal.addEventListener("click", resetAllFilters);
  }
  if (resetAllEmpty) resetAllEmpty.addEventListener("click", resetAllFilters);

  [filterLevel, filterFunding].forEach(function (filter) {
    if (filter) {
      filter.addEventListener("change", applyAllFilters);
    }
  });
}

// ========================================
// HALAMAN DETAIL BEASISWA & REDIRECT CHECKLIST
// ========================================
function initFocusedDetailPage() {
  const detailCards = document.querySelectorAll(
    ".detail-main-card[data-scholarship-id]",
  );
  if (!detailCards.length) return;

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");

  const matchedCard =
    Array.from(detailCards).find(
      (card) => card.dataset.scholarshipId === requestedId,
    ) || detailCards[0];

  const activeId = matchedCard.dataset.scholarshipId;

  detailCards.forEach((card) => {
    card.classList.toggle("d-none", card !== matchedCard);
  });

  const activeTitle = matchedCard
    .querySelector(".detail-title")
    ?.textContent?.trim();
  if (activeTitle) {
    document.title = `${activeTitle} - Beasify`;
  }

  const BOOKMARK_KEY = "beasify_bookmarks";
  const bookmarkBtn = matchedCard.querySelector(".js-bookmark-btn");
  const bookmarkIcon = bookmarkBtn?.querySelector("i");

  function getBookmarks() {
    const raw = safeJsonParse(localStorage.getItem(BOOKMARK_KEY), []);
    return Array.isArray(raw) ? raw : [];
  }

  function saveBookmarks(ids) {
    try {
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(ids));
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  function renderBookmark() {
    if (!bookmarkBtn || !bookmarkIcon) return;
    const isSaved = getBookmarks().includes(activeId);
    bookmarkBtn.classList.toggle("bookmarked", isSaved);
    bookmarkBtn.setAttribute("aria-pressed", String(isSaved));
    bookmarkIcon.className = isSaved ? "bi bi-bookmark-fill" : "bi bi-bookmark";
  }

  if (bookmarkBtn) {
    renderBookmark();
    bookmarkBtn.addEventListener("click", function () {
      let bookmarks = getBookmarks();
      if (bookmarks.includes(activeId)) {
        bookmarks = bookmarks.filter((item) => item !== activeId);
        saveBookmarks(bookmarks);
        renderBookmark();
        showBeasifyToast("Dihapus dari Bookmark.");
      } else {
        bookmarks.push(activeId);
        saveBookmarks(bookmarks);
        renderBookmark();
        showBeasifyToast("Beasiswa disimpan ke Bookmark!");
      }
    });
  }

  const applyLink = matchedCard.querySelector(".btn-apply-now");
  if (applyLink) {
    applyLink.addEventListener("click", function (event) {
      event.preventDefault();
      const targetUrl = `checklist-dokumen.html?id=${encodeURIComponent(activeId)}`;
      const label = activeTitle || "program beasiswa";

      showBeasifyToast(
        `Form checklist dokumen untuk ${label} sedang disiapkan...`,
        1400,
      );
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 850);
    });
  }
}

// ========================================
// CHECKLIST DOKUMEN, VERIFIKASI & UPLOAD BERKAS
// ========================================
const SAMPLE_CHECKLIST_SETS = {
  akademikKepemimpinan: [
    {
      id: "ktp-ktm",
      label:
        "Kartu Tanda Penduduk (KTP) / Kartu Tanda Mahasiswa (KTM) Mahasiswa Aktif",
      required: true,
    },
    {
      id: "transkrip",
      label: "Transkrip Nilai Akademik Terakhir (Sesuai Ketentuan IPK Program)",
      required: true,
    },
    {
      id: "rekomendasi",
      label: "Surat Rekomendasi dari Dosen / Universitas",
      required: true,
    },
    {
      id: "cv-portofolio",
      label: "Curriculum Vitae (CV) Terbaru & Portofolio Pendukung",
      required: true,
    },
    {
      id: "esai",
      label: "Esai Motivasi (Motivation Letter) Pengajuan Beasiswa",
      required: true,
    },
    {
      id: "sertifikat",
      label: "Sertifikat Prestasi Akademik / Non-Akademik",
      required: false,
    },
  ],
  afirmasiTalenta: [
    {
      id: "identitas-ktm",
      label: "Kartu Tanda Penduduk (KTP) / Kartu Keluarga (KK) / KTM Aktif",
      required: true,
    },
    {
      id: "transkrip-ijazah",
      label: "Transkrip Nilai Akademik / Ijazah Jenjang Sebelumnya",
      required: true,
    },
    {
      id: "syarat-khusus",
      label: "Surat Keterangan Afirmasi / Piagam Prestasi / Surat Aktif Studi",
      required: true,
    },
    {
      id: "esai-rencana",
      label: "Esai Motivasi & Rencana Studi / Kontribusi",
      required: true,
    },
    {
      id: "dokumen-pendukung",
      label: "Sertifikat Bahasa, Organisasi, atau Dokumen Pendukung",
      required: false,
    },
  ],
};

const CHECKLIST_PROGRAMS = {
  "karti-unggulan": {
    title: "Beasiswa Karti Unggulan",
    provider: "Instansi Kalla Jusuf",
    sampleKey: "akademikKepemimpinan",
    officialUrl: "",
  },
  "indonesia-bangkit": {
    title: "Beasiswa Indonesia Bangkit",
    provider: "PT Bank Sejahtera",
    sampleKey: "akademikKepemimpinan",
    officialUrl: "",
  },
  "unggulan-kemendikbud": {
    title: "Beasiswa Unggulan Kemendikbud",
    provider: "Puslapdik Kemendikbudristek",
    sampleKey: "afirmasiTalenta",
    officialUrl: "",
  },
  "prestasi-talenta": {
    title: "Beasiswa Prestasi Talenta",
    provider: "Yayasan Pendidikan Nusantara",
    sampleKey: "afirmasiTalenta",
    officialUrl: "",
  },
  "tanoto-scholar": {
    title: "Tanoto Foundation Scholar",
    provider: "Tanoto Foundation",
    sampleKey: "akademikKepemimpinan",
    officialUrl: "",
  },
  "lpdp-afirmasi": {
    title: "Beasiswa LPDP Afirmasi",
    provider: "Kemenkeu RI",
    sampleKey: "afirmasiTalenta",
    officialUrl: "",
  },
};

function initChecklistDokumen() {
  const checklistList = document.getElementById("checklistItemsList");
  if (!checklistList) return;

  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];

  const params = new URLSearchParams(window.location.search);
  const scholarshipId = params.get("id") || "karti-unggulan";
  const program =
    CHECKLIST_PROGRAMS[scholarshipId] || CHECKLIST_PROGRAMS["karti-unggulan"];
  const docs =
    SAMPLE_CHECKLIST_SETS[program.sampleKey] ||
    SAMPLE_CHECKLIST_SETS.akademikKepemimpinan;
  const requiredDocs = docs.filter((d) => d.required);

  const storageKey = `beasify_checklist_${scholarshipId}`;
  const uploadsKey = `beasify_checklist_uploads_${scholarshipId}`;
  const appliedKey = "beasify_applied_scholarships";

  document.title = `Verifikasi Berkas - ${program.title} | Beasify`;

  const titleEl = document.getElementById("verificationTitle");
  const subEl = document.getElementById("verificationProgramSub");
  const progressEl = document.getElementById("verificationRequiredProgress");
  const backLink = document.getElementById("backToDetailLink");
  const submitBtn = document.getElementById("submitChecklistBtn");
  const redirectModalEl = document.getElementById("redirectOfficialModal");
  const successModalEl = document.getElementById("successRegisterModal");
  const btnCompleteSimulation = document.getElementById(
    "btnCompleteSimulation",
  );

  if (titleEl) titleEl.textContent = program.title;
  if (subEl) {
    subEl.textContent = `Program: ${program.title} (${program.provider})`;
  }
  if (backLink) {
    backLink.href = `detail-beasiswa.html?id=${encodeURIComponent(scholarshipId)}`;
  }

  function formatFileSize(bytes) {
    if (typeof bytes !== "number" || Number.isNaN(bytes)) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function isValidFile(file) {
    const lowerName = (file.name || "").toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) =>
      lowerName.endsWith(ext),
    );
    if (!hasValidExt) {
      return {
        ok: false,
        message: "Format berkas harus PDF, JPG, JPEG, PNG, DOC, atau DOCX.",
      };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        ok: false,
        message: "Ukuran berkas maksimal 5 MB per file.",
      };
    }
    return { ok: true };
  }

  function getCheckedIds() {
    const raw = safeJsonParse(localStorage.getItem(storageKey), []);
    return Array.isArray(raw) ? raw : [];
  }

  function saveCheckedIds(ids) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(ids));
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  function getUploadedFiles() {
    const raw = safeJsonParse(localStorage.getItem(uploadsKey), {});
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  }

  function saveUploadedFiles(filesMap) {
    try {
      localStorage.setItem(uploadsKey, JSON.stringify(filesMap));
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  function syncSubmitButton() {
    const checked = getCheckedIds();
    const uploaded = getUploadedFiles();

    const uploadedRequiredCount = requiredDocs.filter(
      (doc) => Boolean(uploaded[doc.id]) && checked.includes(doc.id),
    ).length;

    if (progressEl) {
      progressEl.textContent = `Berkas Wajib: ${uploadedRequiredCount}/${requiredDocs.length} Terunggah`;
    }

    if (!submitBtn) return;
    const allRequiredReady = requiredDocs.every(
      (doc) => checked.includes(doc.id) && Boolean(uploaded[doc.id]),
    );
    submitBtn.disabled = !allRequiredReady;
  }

  function renderChecklistItems() {
    const checkedIds = getCheckedIds();
    const uploadedMap = getUploadedFiles();

    checklistList.innerHTML = docs
      .map((doc) => {
        const checked = checkedIds.includes(doc.id);
        const fileInfo = uploadedMap[doc.id];
        const statusClass = doc.required ? "is-required" : "is-optional";
        const statusText = doc.required ? "* Wajib diunggah" : "Opsional";
        const safeId = escapeHtml(doc.id);
        const safeLabel = escapeHtml(doc.label);

        return `
          <div class="verification-doc-box is-doc-card ${checked ? "is-checked" : ""}" data-doc-box-id="${safeId}">
            <label class="verification-doc-header" for="doc-${safeId}">
              <input type="checkbox" class="verification-circle-input" id="doc-${safeId}"
                data-doc-id="${safeId}" ${checked ? "checked" : ""}>
              <span class="verification-doc-content">
                <span class="verification-doc-title">${safeLabel}</span>
                <span class="verification-doc-status ${statusClass}">${statusText}</span>
              </span>
            </label>

            <div class="verification-upload-row">
              <input type="file" class="d-none js-doc-file-input" id="file-${safeId}"
                data-doc-id="${safeId}" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">

              <button type="button" class="btn-doc-upload js-trigger-upload" data-file-target="file-${safeId}">
                <i class="bi bi-cloud-arrow-up"></i>
                <span>${fileInfo ? "Ganti Berkas" : "Upload Berkas"}</span>
              </button>

              <div class="verification-file-meta ${fileInfo ? "has-file" : ""}">
                ${
                  fileInfo
                    ? `<i class="bi bi-file-earmark-check-fill"></i>
                       <span class="verification-file-name" title="${escapeHtml(fileInfo.name)} (${escapeHtml(formatFileSize(fileInfo.size))})">
                         ${escapeHtml(fileInfo.name)} (${escapeHtml(formatFileSize(fileInfo.size))})
                       </span>
                       <button type="button" class="btn-doc-remove-file js-remove-file" data-doc-id="${safeId}"
                         aria-label="Hapus berkas ${escapeHtml(fileInfo.name)}" title="Hapus berkas">
                         <i class="bi bi-x-circle-fill"></i>
                       </button>`
                    : `<i class="bi bi-paperclip"></i>
                       <span>Belum ada berkas diunggah</span>`
                }
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    checklistList
      .querySelectorAll(".verification-circle-input")
      .forEach((input) => {
        input.addEventListener("change", function () {
          const docId = this.dataset.docId;
          const uploadedMapCurrent = getUploadedFiles();

          if (this.checked && !uploadedMapCurrent[docId]) {
            this.checked = false;
            showBeasifyToast(
              "Unggah berkas terlebih dahulu sebelum mencentang item ini.",
            );
            return;
          }

          let current = getCheckedIds();
          if (this.checked && !current.includes(docId)) {
            current.push(docId);
          } else if (!this.checked) {
            current = current.filter((item) => item !== docId);
          }

          saveCheckedIds(current);
          this.closest(".verification-doc-box")?.classList.toggle(
            "is-checked",
            this.checked,
          );
          syncSubmitButton();
        });
      });

    checklistList.querySelectorAll(".js-trigger-upload").forEach((btn) => {
      btn.addEventListener("click", function () {
        const targetInputId = this.dataset.fileTarget;
        const fileInput = document.getElementById(targetInputId);
        fileInput?.click();
      });
    });

    checklistList
      .querySelectorAll(".js-doc-file-input")
      .forEach((fileInput) => {
        fileInput.addEventListener("change", function () {
          const file = this.files && this.files[0];
          if (!file) return;

          const docId = this.dataset.docId;
          const validation = isValidFile(file);
          if (!validation.ok) {
            this.value = "";
            showBeasifyToast(validation.message);
            return;
          }

          const currentUploads = getUploadedFiles();
          currentUploads[docId] = {
            name: file.name,
            size: file.size,
            type: file.type || "berkas",
            uploadedAt: new Date().toISOString(),
          };
          saveUploadedFiles(currentUploads);

          const currentChecked = getCheckedIds();
          if (!currentChecked.includes(docId)) {
            currentChecked.push(docId);
            saveCheckedIds(currentChecked);
          }

          showBeasifyToast(`Berkas "${file.name}" berhasil diunggah.`);
          renderChecklistItems();
        });
      });

    checklistList.querySelectorAll(".js-remove-file").forEach((removeBtn) => {
      removeBtn.addEventListener("click", function () {
        const docId = this.dataset.docId;
        const currentUploads = getUploadedFiles();
        const removedName = currentUploads[docId]?.name || "berkas";
        delete currentUploads[docId];
        saveUploadedFiles(currentUploads);

        const updatedChecked = getCheckedIds().filter((id) => id !== docId);
        saveCheckedIds(updatedChecked);

        showBeasifyToast(`Berkas "${removedName}" dihapus.`);
        renderChecklistItems();
      });
    });

    syncSubmitButton();
  }

  renderChecklistItems();

  if (submitBtn) {
    submitBtn.addEventListener("click", function () {
      const checked = getCheckedIds();
      const uploaded = getUploadedFiles();
      const allRequiredReady = requiredDocs.every(
        (doc) => checked.includes(doc.id) && Boolean(uploaded[doc.id]),
      );

      if (!allRequiredReady) {
        showBeasifyToast(
          "Unggah dan centang seluruh berkas bertanda * Wajib diunggah terlebih dahulu.",
        );
        return;
      }

      const simProgramTitle = document.getElementById("simProgramTitle");
      const simOfficialUrlText = document.getElementById("simOfficialUrlText");
      const officialLink =
        program.officialUrl && program.officialUrl.startsWith("http")
          ? program.officialUrl
          : `https://portal-resmi.beasify.example/${encodeURIComponent(scholarshipId)}`;

      if (simProgramTitle) simProgramTitle.textContent = program.title;
      if (simOfficialUrlText) {
        simOfficialUrlText.textContent = `Portal Resmi: ${officialLink}`;
      }

      if (redirectModalEl && typeof bootstrap !== "undefined") {
        bootstrap.Modal.getOrCreateInstance(redirectModalEl).show();
      } else {
        showBeasifyToast(
          `Mengarahkan ke laman daftar resmi ${program.title}...`,
        );
      }
    });
  }

  if (btnCompleteSimulation) {
    btnCompleteSimulation.addEventListener("click", function () {
      const raw = safeJsonParse(localStorage.getItem(appliedKey), []);
      const applied = Array.isArray(raw) ? raw : [];
      if (!applied.includes(scholarshipId)) {
        applied.push(scholarshipId);
        try {
          localStorage.setItem(appliedKey, JSON.stringify(applied));
        } catch {
          // Abaikan jika localStorage tidak tersedia
        }
      }

      const successProgramTitle = document.getElementById(
        "successProgramTitle",
      );
      if (successProgramTitle) {
        successProgramTitle.textContent = program.title;
      }

      if (redirectModalEl && typeof bootstrap !== "undefined") {
        bootstrap.Modal.getInstance(redirectModalEl)?.hide();
      }

      if (successModalEl && typeof bootstrap !== "undefined") {
        setTimeout(() => {
          bootstrap.Modal.getOrCreateInstance(successModalEl).show();
        }, 200);
      } else {
        showBeasifyToast(`Sukses mendaftar program ${program.title}!`);
      }
    });
  }
}

// ========================================
// HALAMAN BOOKMARK LIST & BERANDA BOOKMARK
// ========================================
const BOOKMARK_CATALOG = {
  "karti-unggulan": {
    id: "karti-unggulan",
    title: "Beasiswa Karti Unggulan",
    provider: "Instansi Kalla Jusuf",
    levelLabel: "Jenjang S1",
    levels: ["S1"],
    funding: "Fully Funded",
    badgeClass: "badge-funded",
    deadline: "30 Nov 2026",
  },
  "indonesia-bangkit": {
    id: "indonesia-bangkit",
    title: "Beasiswa Indonesia Bangkit",
    provider: "PT Bank Sejahtera",
    levelLabel: "Jenjang S1",
    levels: ["S1"],
    funding: "Fully Funded",
    badgeClass: "badge-funded",
    deadline: "15 Des 2026",
  },
  "unggulan-kemendikbud": {
    id: "unggulan-kemendikbud",
    title: "Beasiswa Unggulan Kemendikbud",
    provider: "Puslapdik Kemendikbudristek",
    levelLabel: "Jenjang S1/S2",
    levels: ["S1", "S2"],
    funding: "Fully Funded",
    badgeClass: "badge-funded",
    deadline: "16 Des 2026",
  },
  "prestasi-talenta": {
    id: "prestasi-talenta",
    title: "Beasiswa Prestasi Talenta",
    provider: "Yayasan Pendidikan Nusantara",
    levelLabel: "Jenjang S1",
    levels: ["S1"],
    funding: "Partial Funded",
    badgeClass: "badge-partial",
    deadline: "22 Des 2026",
  },
  "tanoto-scholar": {
    id: "tanoto-scholar",
    title: "Tanoto Foundation Scholar",
    provider: "Tanoto Foundation",
    levelLabel: "Jenjang S2",
    levels: ["S2"],
    funding: "Fully Funded",
    badgeClass: "badge-funded",
    deadline: "01 Jan 2027",
  },
  "lpdp-afirmasi": {
    id: "lpdp-afirmasi",
    title: "Beasiswa LPDP Afirmasi",
    provider: "Kemenkeu RI",
    levelLabel: "Jenjang S1/S2",
    levels: ["S1", "S2"],
    funding: "Fully Funded",
    badgeClass: "badge-funded",
    deadline: "02 Jan 2027",
  },
};

function initBookmarkPage() {
  const container = document.getElementById("bookmarkListContainer");
  if (!container) return;

  const BOOKMARK_KEY = "beasify_bookmarks";
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const filterLevel = document.getElementById("filterLevel");
  const filterFunding = document.getElementById("filterFunding");
  const applyFilter = document.getElementById("applyFilter");
  const resetFilterModal = document.getElementById("resetFilterModal");
  const resetAllEmpty = document.getElementById("resetAllEmpty");
  const emptyState = document.getElementById("emptyState");
  const emptyStateTitle = document.getElementById("emptyStateTitle");
  const emptyStateMessage = document.getElementById("emptyStateMessage");

  function readBookmarks() {
    const raw = safeJsonParse(localStorage.getItem(BOOKMARK_KEY), []);
    return Array.isArray(raw) ? raw : [];
  }

  function writeBookmarks(ids) {
    try {
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(ids));
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  function renderBookmarkCards() {
    const savedIds = readBookmarks();
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const selectedLevel = filterLevel ? filterLevel.value : "";
    const selectedFunding = filterFunding ? filterFunding.value : "";

    const savedItems = savedIds
      .map((id) => BOOKMARK_CATALOG[id])
      .filter(Boolean);

    const filteredItems = savedItems.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.provider.toLowerCase().includes(keyword) ||
        item.levelLabel.toLowerCase().includes(keyword) ||
        item.funding.toLowerCase().includes(keyword);

      const matchLevel = !selectedLevel || item.levels.includes(selectedLevel);
      const matchFunding = !selectedFunding || item.funding === selectedFunding;

      return matchKeyword && matchLevel && matchFunding;
    });

    container.innerHTML = filteredItems
      .map(
        (item) => `
        <div class="col-12 col-sm-6 col-lg-4 scholarship-item">
          <div class="card scholarship-card h-100 d-flex flex-column">
            <div class="bookmark-card-top">
              <div class="scholarship-image"></div>
              <button type="button" class="btn-bookmark-toggle-card js-remove-bookmark"
                data-bookmark-id="${escapeHtml(item.id)}" aria-label="Hapus ${escapeHtml(item.title)} dari Bookmark"
                title="Hapus dari Bookmark">
                <i class="bi bi-bookmark-fill"></i>
              </button>
            </div>

            <div class="card-body d-flex flex-column flex-grow-1">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="scholarship-level">${escapeHtml(item.levelLabel)}</span>
                <span class="scholarship-badge ${escapeHtml(item.badgeClass)}">${escapeHtml(item.funding)}</span>
              </div>

              <div class="scholarship-content flex-grow-1">
                <h2 class="card-title">${escapeHtml(item.title)}</h2>
                <p class="card-text">${escapeHtml(item.provider)}</p>
              </div>

              <div class="d-flex justify-content-end mt-3">
                <a href="detail-beasiswa.html?id=${encodeURIComponent(item.id)}" class="detail-link">
                  <span>Detail</span>
                  <i class="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>

            <div class="scholarship-deadline px-3 py-2">
              <p class="mb-0">Deadline: ${escapeHtml(item.deadline)}</p>
            </div>
          </div>
        </div>
      `,
      )
      .join("");

    if (!emptyState) return;

    if (filteredItems.length === 0) {
      emptyState.classList.remove("d-none");
      const hasActiveFilter = Boolean(
        keyword || selectedLevel || selectedFunding,
      );

      if (savedItems.length === 0) {
        if (emptyStateTitle) {
          emptyStateTitle.textContent = "Belum Ada Beasiswa di Bookmark";
        }
        if (emptyStateMessage) {
          emptyStateMessage.textContent =
            "Simpan program beasiswa favoritmu dari halaman detail agar mudah dipantau kembali.";
        }
        resetAllEmpty?.classList.add("d-none");
      } else {
        if (emptyStateTitle) {
          emptyStateTitle.textContent = "Beasiswa Tidak Ditemukan";
        }
        if (emptyStateMessage) {
          const parts = [];
          if (keyword) parts.push(`kata kunci "${keyword}"`);
          if (selectedLevel) parts.push(`jenjang ${selectedLevel}`);
          if (selectedFunding) parts.push(`pendanaan ${selectedFunding}`);
          emptyStateMessage.textContent = hasActiveFilter
            ? `Tidak ada bookmark yang cocok dengan ${parts.join(" dan ")}. Coba ubah pencarian atau reset filter.`
            : "Tidak ada data yang tampil.";
        }
        resetAllEmpty?.classList.remove("d-none");
      }
    } else {
      emptyState.classList.add("d-none");
    }
  }

  function resetFilters() {
    if (searchInput) searchInput.value = "";
    if (filterLevel) filterLevel.value = "";
    if (filterFunding) filterFunding.value = "";
    renderBookmarkCards();
  }

  container.addEventListener("click", function (event) {
    const removeBtn = event.target.closest(".js-remove-bookmark");
    if (!removeBtn) return;

    const targetId = removeBtn.dataset.bookmarkId;
    const updated = readBookmarks().filter((id) => id !== targetId);
    writeBookmarks(updated);
    renderBookmarkCards();
    showBeasifyToast("Beasiswa dihapus dari Bookmark.");
  });

  if (searchInput) {
    searchInput.addEventListener("input", renderBookmarkCards);
    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        renderBookmarkCards();
      }
    });
  }

  if (searchButton) searchButton.addEventListener("click", renderBookmarkCards);
  if (applyFilter) applyFilter.addEventListener("click", renderBookmarkCards);
  if (resetFilterModal) {
    resetFilterModal.addEventListener("click", resetFilters);
  }
  if (resetAllEmpty) resetAllEmpty.addEventListener("click", resetFilters);

  [filterLevel, filterFunding].forEach((el) => {
    if (el) el.addEventListener("change", renderBookmarkCards);
  });

  renderBookmarkCards();
}

function initBerandaBookmarks() {
  const list = document.getElementById("scholarshipList");
  if (!list) return;

  const BOOKMARK_KEY = "beasify_bookmarks";
  const cards = list.querySelectorAll(".scholarship-card[data-scholarship-id]");

  function readBookmarks() {
    const raw = safeJsonParse(localStorage.getItem(BOOKMARK_KEY), []);
    return Array.isArray(raw) ? raw : [];
  }

  function writeBookmarks(ids) {
    try {
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(ids));
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  function syncCardButton(card, isSaved) {
    const btn = card.querySelector(".js-bookmark-btn");
    const icon = btn?.querySelector("i");
    if (!btn || !icon) return;

    btn.classList.toggle("bookmarked", isSaved);
    btn.setAttribute("aria-pressed", String(isSaved));
    icon.className = isSaved ? "bi bi-bookmark-fill" : "bi bi-bookmark";
  }

  const initialBookmarks = readBookmarks();
  cards.forEach((card) => {
    const id = card.dataset.scholarshipId;
    syncCardButton(card, initialBookmarks.includes(id));
  });

  list.addEventListener("click", function (event) {
    const btn = event.target.closest(".js-bookmark-btn");
    if (!btn) return;

    const card = btn.closest(".scholarship-card[data-scholarship-id]");
    const id = card?.dataset.scholarshipId;
    if (!id) return;

    let bookmarks = readBookmarks();
    const exists = bookmarks.includes(id);

    if (exists) {
      bookmarks = bookmarks.filter((item) => item !== id);
      writeBookmarks(bookmarks);
      syncCardButton(card, false);
      showBeasifyToast("Dihapus dari Bookmark.");
    } else {
      bookmarks.push(id);
      writeBookmarks(bookmarks);
      syncCardButton(card, true);
      showBeasifyToast("Beasiswa disimpan ke Bookmark!");
    }
  });
}

// ========================================
// HALAMAN RIWAYAT APPLY (SEARCH + PILL FILTER)
// ========================================
const RIWAYAT_APPLY_CATALOG = [
  {
    id: "indonesia-bangkit",
    title: "Beasiswa Indonesia Bangkit",
    provider: "PT Bank Sejahtera",
    levelLabel: "Jenjang S1",
    statusKey: "dalam-proses",
    badgeText: "Dalam tahap Seleksi Berkas",
    badgeClass: "badge-proses",
    cardClass: "status-dalam-proses",
    docsText: "Berkas: 5/5 Lengkap",
    dateText: "Diajukan : 12 Okt 2026",
  },
  {
    id: "prestasi-talenta",
    title: "Beasiswa Prestasi Talenta",
    provider: "PT Kenangan Raya Food",
    levelLabel: "Jenjang S1",
    statusKey: "dalam-proses",
    badgeText: "Lengkap Berkas",
    badgeClass: "badge-proses",
    cardClass: "status-dalam-proses",
    docsText: "Berkas: 3/5 Lengkap",
    dateText: "Disimpan : 14 Okt 2026",
  },
  {
    id: "beasiswa-bioro",
    title: "Beasiswa Bioro",
    provider: "PT Uniliver",
    levelLabel: "Jenjang S1",
    statusKey: "tidak-lolos",
    badgeText: "Tidak Lolos",
    badgeClass: "badge-tidak-lolos",
    cardClass: "status-tidak-lolos",
    docsText: "Berkas: 5/5 Lengkap",
    dateText: "Diajukan : 30 Agu 2026",
  },
  {
    id: "ambara-scholarship",
    title: "Ambara Scholarship",
    provider: "Ambara Institute",
    levelLabel: "Jenjang S1/S2/S3",
    statusKey: "lolos",
    badgeText: "Lolos",
    badgeClass: "badge-lolos",
    cardClass: "status-lolos",
    docsText: "Berkas: 5/5 Lengkap",
    dateText: "Diajukan : 20 Jul 2026",
  },
];

function initRiwayatApplyPage() {
  const container = document.getElementById("riwayatListContainer");
  if (!container) return;

  const searchInput = document.getElementById("riwayatSearchInput");
  const searchButton = document.getElementById("riwayatSearchButton");
  const pillButtons = document.querySelectorAll(
    "#riwayatFilterPills .riwayat-pill",
  );
  const emptyState = document.getElementById("riwayatEmptyState");
  const resetBtn = document.getElementById("riwayatResetBtn");

  let activeStatus = "semua";

  function getMergedHistory() {
    const raw = safeJsonParse(
      localStorage.getItem("beasify_applied_scholarships"),
      [],
    );
    const appliedIds = Array.isArray(raw) ? raw : [];
    const items = [...RIWAYAT_APPLY_CATALOG];

    appliedIds.forEach((id) => {
      const alreadyExists = items.some((item) => item.id === id);
      if (
        !alreadyExists &&
        typeof CHECKLIST_PROGRAMS !== "undefined" &&
        CHECKLIST_PROGRAMS[id]
      ) {
        const prog = CHECKLIST_PROGRAMS[id];
        const uploadedMap = safeJsonParse(
          localStorage.getItem(`beasify_checklist_uploads_${id}`),
          {},
        );
        const uploadedCount = Object.keys(uploadedMap || {}).length;

        items.unshift({
          id,
          title: prog.title,
          provider: prog.provider,
          levelLabel: "Jenjang S1/S2",
          statusKey: "dalam-proses",
          badgeText: "Dalam tahap Seleksi Berkas",
          badgeClass: "badge-proses",
          cardClass: "status-dalam-proses",
          docsText:
            uploadedCount > 0
              ? `Berkas: ${uploadedCount} Berkas Terunggah`
              : "Berkas: Lengkap",
          dateText: "Diajukan : Baru saja",
        });
      }
    });

    return items;
  }

  function syncPillStates() {
    pillButtons.forEach((btn) => {
      const isSelected = btn.dataset.statusFilter === activeStatus;
      btn.classList.toggle("is-active", isSelected);
      btn.setAttribute("aria-pressed", String(isSelected));
    });
  }

  function renderRiwayatCards() {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const allItems = getMergedHistory();

    const filtered = allItems.filter((item) => {
      const matchStatus =
        activeStatus === "semua" || item.statusKey === activeStatus;

      const matchKeyword =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        item.provider.toLowerCase().includes(keyword) ||
        item.levelLabel.toLowerCase().includes(keyword) ||
        item.badgeText.toLowerCase().includes(keyword);

      return matchStatus && matchKeyword;
    });

    container.innerHTML = filtered
      .map(
        (item) => `
        <div class="col-12 col-md-6">
          <article class="riwayat-card ${escapeHtml(item.cardClass)} h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-end mb-1">
                <span class="riwayat-status-badge ${escapeHtml(item.badgeClass)}">${escapeHtml(item.badgeText)}</span>
              </div>
              <p class="riwayat-level">${escapeHtml(item.levelLabel)}</p>
              <h2 class="riwayat-title">${escapeHtml(item.title)}</h2>
              <p class="riwayat-provider">${escapeHtml(item.provider)}</p>
              <p class="riwayat-docs-status">${escapeHtml(item.docsText)}</p>
              <p class="riwayat-date-text">${escapeHtml(item.dateText)}</p>
            </div>

            <div class="riwayat-card-footer">
              <a href="detail-beasiswa.html?id=${encodeURIComponent(item.id)}" class="riwayat-detail-link">
                <span>Detail</span>
                <i class="bi bi-arrow-right"></i>
              </a>
            </div>
          </article>
        </div>
      `,
      )
      .join("");

    if (emptyState) {
      emptyState.classList.toggle("d-none", filtered.length > 0);
    }
  }

  pillButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      activeStatus = this.dataset.statusFilter || "semua";
      syncPillStates();
      renderRiwayatCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", renderRiwayatCards);
    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        renderRiwayatCards();
      }
    });
  }

  if (searchButton) {
    searchButton.addEventListener("click", renderRiwayatCards);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      activeStatus = "semua";
      if (searchInput) searchInput.value = "";
      syncPillStates();
      renderRiwayatCards();
    });
  }

  syncPillStates();
  renderRiwayatCards();
}

// ========================================
// HALAMAN PROFIL SOBAT (DUMMY DATA, EDIT & SIMPAN)
// ========================================
const PROFIL_STORAGE_KEY = "beasify_profile";

const DEFAULT_PROFIL_DUMMY = {
  namaLengkap: "Nadia Kusuma Wardani",
  alamatEmail: "nadia.kusuma04@example.com",
  nomorTelepon: "+6285298765432",
  kotaDomisili: "Makassar",
  instansiUniversitas: "Universitas Negeri Nusantara",
  programStudi: "Desain Komunikasi Visual",
  jenjangSaatIni: "Sarjana (S1)",
  semesterAktif: "7",
  ipkNilai: "3.78",
  tahunLulus: "2027",
};

const PROFIL_FIELD_IDS = [
  "namaLengkap",
  "alamatEmail",
  "nomorTelepon",
  "kotaDomisili",
  "instansiUniversitas",
  "programStudi",
  "jenjangSaatIni",
  "semesterAktif",
  "ipkNilai",
  "tahunLulus",
];

function initProfilPage() {
  const form = document.getElementById("profilForm");
  if (!form) return;

  const editBtn = document.getElementById("editProfilBtn");
  const saveBtn = document.getElementById("saveProfilBtn");
  const cancelBtn = document.getElementById("cancelProfilBtn");

  const inputs = PROFIL_FIELD_IDS.map((id) =>
    document.getElementById(id),
  ).filter(Boolean);

  function writeProfile(data) {
    try {
      localStorage.setItem(PROFIL_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  function readProfile() {
    const raw = safeJsonParse(localStorage.getItem(PROFIL_STORAGE_KEY), null);
    if (raw && typeof raw === "object" && Object.keys(raw).length > 0) {
      return { ...DEFAULT_PROFIL_DUMMY, ...raw };
    }
    writeProfile(DEFAULT_PROFIL_DUMMY);
    return { ...DEFAULT_PROFIL_DUMMY };
  }

  function populateForm(data) {
    inputs.forEach((input) => {
      input.value = data[input.id] ?? "";
    });
  }

  function collectFormData() {
    const result = {};
    inputs.forEach((input) => {
      result[input.id] = input.value.trim();
    });
    return result;
  }

  function setEditing(isEditing) {
    inputs.forEach((input) => {
      const box = input.closest(".profil-field-box");
      if (isEditing) {
        input.removeAttribute("readonly");
        box?.classList.add("is-editable");
      } else {
        input.setAttribute("readonly", "readonly");
        box?.classList.remove("is-editable");
      }
    });

    editBtn?.classList.toggle("d-none", isEditing);
    saveBtn?.classList.toggle("d-none", !isEditing);
    cancelBtn?.classList.toggle("d-none", !isEditing);

    if (isEditing && inputs[0]) {
      inputs[0].focus();
    }
  }

  populateForm(readProfile());
  setEditing(false);

  if (editBtn) {
    editBtn.addEventListener("click", function () {
      setEditing(true);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      populateForm(readProfile());
      setEditing(false);
      showBeasifyToast("Perubahan profil dibatalkan.");
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const updatedData = collectFormData();
    writeProfile(updatedData);
    populateForm(updatedData);
    setEditing(false);
    showBeasifyToast("Data profil berhasil disimpan!");
  });
}

// ========================================
// HALAMAN DASHBOARD & FORM PUBLIKASI MITRA
// ========================================
const MITRA_PROGRAMS_KEY = "beasify_mitra_programs";
const MITRA_PROFIL_STORAGE_KEY = "beasify_mitra_profile";

const DEFAULT_MITRA_PROGRAMS = [
  {
    id: "karti-unggulan",
    title: "Beasiswa Karti Unggulan",
    provider: "Instansi Kalla Jusuf",
    level: "S1",
    levelLabel: "Jenjang S1",
    funding: "Fully Funded",
    badgeClass: "badge-funded",
    bannerUrl: "",
    description:
      "Program dukungan pendidikan penuh bagi mahasiswa berprestasi dengan semangat kepemimpinan dan kontribusi sosial.",
    deadline: "2026-11-30",
    deadlineLabel: "30 Nov 2026",
    region: "Nasional",
    minGpa: "Min. IPK 3.25",
    benefits: [
      "Bantuan biaya pendidikan penuh hingga lulus",
      "Tunjangan biaya hidup bulanan dan pembinaan",
    ],
    quota: 25,
    officialUrl: "https://beasiswa.example.com/karti-unggulan",
    status: "aktif",
    applicantsCount: 20,
    viewsCount: 500,
  },
];

function formatMitraCount(num) {
  return String(Math.max(0, Number(num) || 0)).padStart(2, "0");
}

function formatDeadlineIndo(dateStr) {
  if (!dateStr) return "-";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  const year = parts[0];
  const monthIdx = Number(parts[1]) - 1;
  const day = String(Number(parts[2])).padStart(2, "0");
  const monthName = months[monthIdx] || parts[1];
  return `${day} ${monthName} ${year}`;
}

function getFundingBadgeClass(funding) {
  if (funding === "Fully Funded") return "badge-funded";
  if (funding === "Partial Funded") return "badge-partial";
  return "badge-nonfunded";
}

function initMitraDashboardPage() {
  const dashboardView = document.getElementById("mitraDashboardView");
  const formView = document.getElementById("mitraFormView");
  const form = document.getElementById("mitraProgramForm");
  if (!dashboardView || !formView || !form) return;

  const programListEl = document.getElementById("mitraProgramList");
  const activeCountEl = document.getElementById("mitraActiveCount");
  const totalViewsEl = document.getElementById("mitraTotalViews");
  const welcomeTextEl = document.getElementById("mitraWelcomeText");

  const openCreateBtn = document.getElementById("openCreateProgramBtn");
  const backToDashboardBtn = document.getElementById("backToDashboardBtn");
  const formHeadingEl = document.getElementById("mitraFormHeading");
  const editIdInput = document.getElementById("programEditId");

  const titleInput = document.getElementById("programName");
  const levelSelect = document.getElementById("programLevel");
  const fundingSelect = document.getElementById("programFunding");
  const bannerFileInput = document.getElementById("programBannerFile");
  const bannerLabelEl = document.getElementById("programBannerLabel");
  const bannerPreviewWrap = document.getElementById("programBannerPreviewWrap");
  const bannerPreviewImg = document.getElementById("programBannerPreviewImg");
  const descInput = document.getElementById("programDescription");
  const deadlineInput = document.getElementById("programDeadline");
  const regionSelect = document.getElementById("programRegion");
  const minGpaSelect = document.getElementById("programMinGpa");
  const benefitContainer = document.getElementById("benefitRowsContainer");
  const addBenefitBtn = document.getElementById("addBenefitBtn");
  const quotaInput = document.getElementById("programQuota");
  const officialUrlInput = document.getElementById("programOfficialUrl");

  let currentBannerDataUrl = "";

  function readMitraPrograms() {
    const raw = safeJsonParse(localStorage.getItem(MITRA_PROGRAMS_KEY), null);
    if (Array.isArray(raw)) {
      return raw.map((p) => ({
        status: "aktif",
        ...p,
      }));
    }
    try {
      localStorage.setItem(
        MITRA_PROGRAMS_KEY,
        JSON.stringify(DEFAULT_MITRA_PROGRAMS),
      );
    } catch {
      // Abaikan
    }
    return [...DEFAULT_MITRA_PROGRAMS];
  }

  function writeMitraPrograms(list) {
    try {
      localStorage.setItem(MITRA_PROGRAMS_KEY, JSON.stringify(list));
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  function getPartnerName() {
    const mitraProf = safeJsonParse(
      localStorage.getItem(MITRA_PROFIL_STORAGE_KEY),
      null,
    );
    if (mitraProf?.namaResmiInstansi) return mitraProf.namaResmiInstansi;

    const profile = safeJsonParse(
      localStorage.getItem(PROFIL_STORAGE_KEY),
      null,
    );
    if (profile?.instansiUniversitas) return profile.instansiUniversitas;

    return "Instansi Kalla Jusuf";
  }

  function createBenefitRowElement(value = "") {
    const row = document.createElement("div");
    row.className = "mitra-benefit-row";
    row.innerHTML = `
      <i class="bi bi-check-circle mitra-benefit-check" aria-hidden="true"></i>
      <input type="text" class="form-control mitra-benefit-input" placeholder="Deskripsi Benefit" value="${escapeHtml(value)}">
      <button type="button" class="btn-remove-benefit" aria-label="Hapus benefit" title="Hapus benefit">
        <i class="bi bi-x-circle"></i>
      </button>
    `;

    row
      .querySelector(".btn-remove-benefit")
      .addEventListener("click", function () {
        const totalRows =
          benefitContainer.querySelectorAll(".mitra-benefit-row").length;
        if (totalRows <= 1) {
          const inputEl = row.querySelector(".mitra-benefit-input");
          if (inputEl) inputEl.value = "";
          showBeasifyToast("Minimal harus ada 1 baris benefit.");
          return;
        }
        row.remove();
      });

    return row;
  }

  function renderBenefitInputs(benefitsArray = ["", ""]) {
    if (!benefitContainer) return;
    benefitContainer.innerHTML = "";
    const items = benefitsArray.length ? benefitsArray : ["", ""];
    items.forEach((b) => {
      benefitContainer.appendChild(createBenefitRowElement(b));
    });
  }

  function collectBenefits() {
    if (!benefitContainer) return [];
    return Array.from(benefitContainer.querySelectorAll(".mitra-benefit-input"))
      .map((el) => el.value.trim())
      .filter(Boolean);
  }

  function setBannerPreview(url, labelText) {
    currentBannerDataUrl = url || "";
    if (bannerLabelEl) {
      bannerLabelEl.textContent =
        labelText ||
        (url ? "Banner program tersimpan" : "Belum ada gambar dipilih");
    }
    if (bannerPreviewWrap && bannerPreviewImg) {
      if (url) {
        bannerPreviewImg.src = url;
        bannerPreviewWrap.classList.remove("d-none");
      } else {
        bannerPreviewImg.src = "";
        bannerPreviewWrap.classList.add("d-none");
      }
    }
  }

  function switchToFormView(programToEdit = null) {
    dashboardView.classList.add("d-none");
    formView.classList.remove("d-none");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (programToEdit) {
      if (formHeadingEl) formHeadingEl.textContent = "Edit Program Beasiswa";
      editIdInput.value = programToEdit.id;
      titleInput.value = programToEdit.title || "";
      levelSelect.value = programToEdit.level || "";
      fundingSelect.value = programToEdit.funding || "";
      descInput.value = programToEdit.description || "";
      deadlineInput.value = programToEdit.deadline || "";
      regionSelect.value = programToEdit.region || "";
      minGpaSelect.value = programToEdit.minGpa || "";
      if (quotaInput) quotaInput.value = programToEdit.quota ?? "";
      if (officialUrlInput) {
        officialUrlInput.value = programToEdit.officialUrl || "";
      }
      setBannerPreview(
        programToEdit.bannerUrl || "",
        programToEdit.bannerUrl
          ? "Banner saat ini terpasang"
          : "Belum ada gambar dipilih",
      );
      renderBenefitInputs(programToEdit.benefits || ["", ""]);
    } else {
      if (formHeadingEl) formHeadingEl.textContent = "Detail Program Beasiswa";
      editIdInput.value = "";
      form.reset();
      setBannerPreview("", "Belum ada gambar dipilih");
      renderBenefitInputs(["", ""]);
    }
  }

  function switchToDashboardView() {
    formView.classList.add("d-none");
    dashboardView.classList.remove("d-none");
    renderDashboard();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openApplicantsModal(program) {
    const modalEl = document.getElementById("applicantsModal");
    const titleEl = document.getElementById("applicantsProgramName");
    const bodyEl = document.getElementById("applicantsModalBody");
    if (!modalEl || !bodyEl || typeof bootstrap === "undefined") return;

    if (titleEl) {
      titleEl.textContent = `${program.title} (${program.applicantsCount} Pelamar)`;
    }

    const sampleNames = [
      "Aulia Rahmawati",
      "Rizky Pratama",
      "Nabila Safitri",
      "Fajar Ramadhan",
      "Siti Nurhaliza",
    ];

    bodyEl.innerHTML = `
      <p class="small text-muted mb-3">
        Total <strong>${escapeHtml(program.applicantsCount)} pelamar</strong> (Kuota: <strong>${escapeHtml(program.quota || "-")}</strong>) telah mengajukan berkas pada program ini.
      </p>
      <div class="d-flex flex-column gap-2">
        ${sampleNames
          .map(
            (name, idx) => `
          <div class="p-3 rounded-3 bg-white border d-flex justify-content-between align-items-center">
            <div>
              <div class="fw-bold small" style="color: var(--secondary-color);">${escapeHtml(name)}</div>
              <div class="text-muted" style="font-size: 11px;">Jenjang ${escapeHtml(program.levelLabel)} • ${escapeHtml(program.minGpa || "IPK Memenuhi")}</div>
            </div>
            <span class="badge rounded-pill text-bg-light border">${idx % 2 === 0 ? "Berkas Lengkap" : "Review"}</span>
          </div>
        `,
          )
          .join("")}
      </div>
    `;

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  function handleEndProgram(programId) {
    const programs = readMitraPrograms();
    const target = programs.find((p) => p.id === programId);
    if (!target) return;

    const updated = programs.map((p) =>
      p.id === programId ? { ...p, status: "disudahi" } : p,
    );
    writeMitraPrograms(updated);
    renderDashboard();
    showBeasifyToast(`Program "${target.title}" telah disudahi.`);
  }

  function handleDeleteProgram(programId) {
    const programs = readMitraPrograms();
    const target = programs.find((p) => p.id === programId);
    if (!target) return;

    const confirmed = window.confirm(
      `Hapus program "${target.title}" secara permanen dari dashboard?`,
    );
    if (!confirmed) return;

    const updated = programs.filter((p) => p.id !== programId);
    writeMitraPrograms(updated);
    renderDashboard();
    showBeasifyToast(`Program "${target.title}" dihapus.`);
  }

  function renderDashboard() {
    const programs = readMitraPrograms();
    const partnerName = getPartnerName();

    if (welcomeTextEl) {
      welcomeTextEl.innerHTML = `Selamat Datang, <span>${escapeHtml(partnerName)}</span>`;
    }

    const activePrograms = programs.filter((p) => p.status !== "disudahi");

    if (activeCountEl) {
      activeCountEl.textContent = formatMitraCount(activePrograms.length);
    }

    const totalViews = programs.reduce(
      (acc, item) => acc + (Number(item.viewsCount) || 0),
      0,
    );
    if (totalViewsEl) {
      totalViewsEl.textContent = String(totalViews);
    }

    if (!programListEl) return;

    if (programs.length === 0) {
      programListEl.innerHTML = `
        <div class="col-12">
          <div class="empty-state-box text-center">
            <h3 class="empty-state-title mb-2">Belum Ada Program Beasiswa</h3>
            <p class="empty-state-desc mb-0">
              Klik tombol <strong>+ Tambah Program Baru</strong> di kanan bawah untuk mempublikasikan program beasiswa pertamamu.
            </p>
          </div>
        </div>
      `;
      return;
    }

    programListEl.innerHTML = programs
      .map((item) => {
        const isEnded = item.status === "disudahi";
        const safeBanner =
          item.bannerUrl && /^(data:image\/|https?:\/\/)/i.test(item.bannerUrl)
            ? `style="background-image: url('${escapeHtml(item.bannerUrl)}'); background-size: cover; background-position: center;"`
            : "";

        return `
          <div class="col-6 col-md-4">
            <article class="mitra-program-card ${isEnded ? "is-ended" : ""} h-100 d-flex flex-column">
              <div class="mitra-program-banner" ${safeBanner}></div>
              <div class="mitra-program-body d-flex flex-column flex-grow-1">
                <div class="d-flex justify-content-between align-items-center gap-1 mb-1">
                  <span class="mitra-program-level">${escapeHtml(item.levelLabel)}</span>
                  <span class="scholarship-badge ${escapeHtml(item.badgeClass || getFundingBadgeClass(item.funding))}">${escapeHtml(item.funding)}</span>
                </div>
                <div class="mb-2">
                  <span class="mitra-status-pill ${isEnded ? "is-ended" : "is-active"}">
                    ${isEnded ? "Disudahi" : "Aktif"}
                  </span>
                </div>
                <h3 class="mitra-program-title">${escapeHtml(item.title)}</h3>
                <p class="mitra-program-provider">${escapeHtml(item.provider || partnerName)}</p>
                <p class="mitra-program-meta flex-grow-1 mb-0">Kuota: ${escapeHtml(item.quota || "-")} • ${escapeHtml(item.region || "-")}</p>

                <div class="mitra-program-actions d-flex flex-wrap gap-2 mt-3">
                  <button type="button" class="btn-mitra-edit flex-fill js-edit-program" data-id="${escapeHtml(item.id)}">
                    Edit Program
                  </button>
                  <button type="button" class="btn-mitra-applicants flex-fill js-view-applicants" data-id="${escapeHtml(item.id)}">
                    Lihat Pelamar (${escapeHtml(item.applicantsCount ?? 0)})
                  </button>
                  ${
                    !isEnded
                      ? `<button type="button" class="btn-mitra-end flex-fill js-end-program" data-id="${escapeHtml(item.id)}">
                           Sudahi Program
                         </button>`
                      : ""
                  }
                  <button type="button" class="btn-mitra-delete flex-fill js-delete-program" data-id="${escapeHtml(item.id)}">
                    Hapus
                  </button>
                </div>
              </div>
            </article>
          </div>
        `;
      })
      .join("");

    programListEl.querySelectorAll(".js-edit-program").forEach((btn) => {
      btn.addEventListener("click", function () {
        const target = readMitraPrograms().find(
          (p) => p.id === this.dataset.id,
        );
        if (target) switchToFormView(target);
      });
    });

    programListEl.querySelectorAll(".js-view-applicants").forEach((btn) => {
      btn.addEventListener("click", function () {
        const target = readMitraPrograms().find(
          (p) => p.id === this.dataset.id,
        );
        if (target) openApplicantsModal(target);
      });
    });

    programListEl.querySelectorAll(".js-end-program").forEach((btn) => {
      btn.addEventListener("click", function () {
        handleEndProgram(this.dataset.id);
      });
    });

    programListEl.querySelectorAll(".js-delete-program").forEach((btn) => {
      btn.addEventListener("click", function () {
        handleDeleteProgram(this.dataset.id);
      });
    });
  }

  if (openCreateBtn) {
    openCreateBtn.addEventListener("click", function () {
      switchToFormView(null);
    });
  }

  if (backToDashboardBtn) {
    backToDashboardBtn.addEventListener("click", function () {
      switchToDashboardView();
    });
  }

  if (addBenefitBtn) {
    addBenefitBtn.addEventListener("click", function () {
      benefitContainer.appendChild(createBenefitRowElement(""));
      const lastInput = benefitContainer.lastElementChild?.querySelector(
        ".mitra-benefit-input",
      );
      lastInput?.focus();
    });
  }

  if (bannerFileInput) {
    bannerFileInput.addEventListener("change", function () {
      const file = this.files && this.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showBeasifyToast("Pilih file gambar (JPG, PNG, atau WebP).");
        this.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (ev) {
        setBannerPreview(String(ev.target?.result || ""), file.name);
        showBeasifyToast("Banner program siap diunggah.");
      };
      reader.readAsDataURL(file);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const level = levelSelect.value;
    const funding = fundingSelect.value;
    const description = descInput.value.trim();
    const deadline = deadlineInput.value;
    const region = regionSelect.value;
    const minGpa = minGpaSelect.value;
    const benefits = collectBenefits();
    const quota = Number(quotaInput?.value || 0);
    const officialUrl = officialUrlInput?.value.trim() || "";

    if (!title) {
      showBeasifyToast("Nama program beasiswa wajib diisi.");
      titleInput.focus();
      return;
    }
    if (!level) {
      showBeasifyToast("Pilih jenjang pendidikan terlebih dahulu.");
      levelSelect.focus();
      return;
    }
    if (!funding) {
      showBeasifyToast("Pilih tipe pendanaan terlebih dahulu.");
      fundingSelect.focus();
      return;
    }
    if (!description) {
      showBeasifyToast("Deskripsi tentang program wajib diisi.");
      descInput.focus();
      return;
    }
    if (!deadline) {
      showBeasifyToast("Pilih jadwal penutupan program terlebih dahulu.");
      deadlineInput.focus();
      return;
    }
    if (!region) {
      showBeasifyToast("Pilih cakupan wilayah terlebih dahulu.");
      regionSelect.focus();
      return;
    }
    if (!minGpa) {
      showBeasifyToast("Pilih ketentuan IPK terlebih dahulu.");
      minGpaSelect.focus();
      return;
    }
    if (!benefits.length) {
      showBeasifyToast("Isi minimal satu benefit beasiswa.");
      benefitContainer.querySelector(".mitra-benefit-input")?.focus();
      return;
    }
    if (!quota || quota < 1) {
      showBeasifyToast("Masukkan kuota penerima minimal 1 orang.");
      quotaInput?.focus();
      return;
    }
    if (!officialUrl || !/^https?:\/\/.+/i.test(officialUrl)) {
      showBeasifyToast(
        "Masukkan link pendaftaran resmi yang diawali http:// atau https://.",
      );
      officialUrlInput?.focus();
      return;
    }

    const existingList = readMitraPrograms();
    const editingId = editIdInput.value.trim();
    const partnerName = getPartnerName();
    const levelLabel =
      level === "S1, S2" ? "Jenjang S1/S2" : `Jenjang ${level}`;

    if (editingId) {
      const updatedList = existingList.map((item) => {
        if (item.id !== editingId) return item;
        return {
          ...item,
          title,
          provider: item.provider || partnerName,
          level,
          levelLabel,
          funding,
          badgeClass: getFundingBadgeClass(funding),
          bannerUrl: currentBannerDataUrl,
          description,
          deadline,
          deadlineLabel: formatDeadlineIndo(deadline),
          region,
          minGpa,
          benefits,
          quota,
          officialUrl,
        };
      });
      writeMitraPrograms(updatedList);
      showBeasifyToast(`Program "${title}" berhasil diperbarui!`);
    } else {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const newProgram = {
        id: `${slug || "program"}-${Date.now()}`,
        title,
        provider: partnerName,
        level,
        levelLabel,
        funding,
        badgeClass: getFundingBadgeClass(funding),
        bannerUrl: currentBannerDataUrl,
        description,
        deadline,
        deadlineLabel: formatDeadlineIndo(deadline),
        region,
        minGpa,
        benefits,
        quota,
        officialUrl,
        status: "aktif",
        applicantsCount: 0,
        viewsCount: 120,
      };
      writeMitraPrograms([newProgram, ...existingList]);
      showBeasifyToast(
        `Program "${title}" berhasil dipublikasikan dan masuk ke Program Aktif!`,
      );
    }

    switchToDashboardView();
  });

  renderDashboard();
}

// ========================================
// LOGIN MITRA -> REDIRECT KE DASHBOARD MITRA
// ========================================
function initMitraLoginRedirect() {
  const loginForm = document.getElementById("mitraLoginForm");
  if (!loginForm) return;

  const emailInput = document.getElementById("mitraLoginEmail");
  const passwordInput = document.getElementById("mitraLoginPassword");
  const submitBtn = document.getElementById("mitraLoginSubmitBtn");
  const googleBtn = document.getElementById("mitraGoogleLoginBtn");
  const forgotLink = document.getElementById("mitraForgotLink");
  const feedbackEl = document.getElementById("mitraLoginFeedback");
  const targetDashboard = "dashboard-mitra.html";

  function setFeedback(message, isError = false) {
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.classList.remove("d-none", "text-danger", "text-dark");
    feedbackEl.classList.add(isError ? "text-danger" : "text-dark");
  }

  function persistMitraSession(emailValue, method) {
    try {
      localStorage.setItem(
        "beasify_mitra_session",
        JSON.stringify({
          role: "mitra",
          email: emailValue,
          method,
          loggedInAt: new Date().toISOString(),
        }),
      );
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  function goToDashboard(emailValue, method) {
    persistMitraSession(emailValue, method);
    if (submitBtn) submitBtn.disabled = true;
    if (googleBtn) googleBtn.disabled = true;

    const msg = "Login Mitra berhasil! Membuka Dashboard Mitra...";
    setFeedback(msg, false);
    showBeasifyToast(msg, 1400);

    setTimeout(function () {
      window.location.href = targetDashboard;
    }, 700);
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const emailVal = emailInput ? emailInput.value.trim() : "";
    const passwordVal = passwordInput ? passwordInput.value : "";
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

    if (!emailVal || !emailValid) {
      const errMsg = "Masukkan alamat email Mitra yang valid terlebih dahulu.";
      setFeedback(errMsg, true);
      showBeasifyToast(errMsg);
      emailInput?.focus();
      return;
    }

    if (!passwordVal) {
      const errMsg = "Password tidak boleh kosong.";
      setFeedback(errMsg, true);
      showBeasifyToast(errMsg);
      passwordInput?.focus();
      return;
    }

    goToDashboard(emailVal, "email");
  });

  if (googleBtn) {
    googleBtn.addEventListener("click", function () {
      setFeedback("Menghubungkan akun Google Mitra...", false);
      showBeasifyToast("Menghubungkan akun Google Mitra...", 1300);
      setTimeout(function () {
        goToDashboard("mitra@google.example", "google");
      }, 650);
    });
  }

  if (forgotLink) {
    forgotLink.addEventListener("click", function (event) {
      event.preventDefault();
      const targetEmail = emailInput?.value.trim();
      const infoMsg = targetEmail
        ? `Tautan reset password dikirim ke ${targetEmail}.`
        : "Masukkan email Mitra terlebih dahulu untuk reset password.";
      setFeedback(infoMsg, false);
      showBeasifyToast(infoMsg, 2400);
    });
  }
}

// ========================================
// HALAMAN PROFIL MITRA (DUMMY DATA, EDIT & SIMPAN)
// ========================================
const DEFAULT_MITRA_PROFIL_DUMMY = {
  namaResmiInstansi: "Instansi Kalla Jusuf",
  kategoriInstansi: "Instansi/Organisasi",
  nomorLegalitasInstansi: "AHU-0018492.AH.01.04.Tahun 2019",
  emailResmiInstansi: "Emailmitra@gmail.com",
  teleponInstansi: "+62000000000",
  alamatKantorPusat: "Alamat Instansi",
};

const MITRA_PROFIL_FIELD_IDS = [
  "namaResmiInstansi",
  "kategoriInstansi",
  "nomorLegalitasInstansi",
  "emailResmiInstansi",
  "teleponInstansi",
  "alamatKantorPusat",
];

function initMitraProfilPage() {
  const form = document.getElementById("mitraProfilForm");
  if (!form) return;

  const editBtn = document.getElementById("editMitraProfilBtn");
  const saveBtn = document.getElementById("saveMitraProfilBtn");
  const cancelBtn = document.getElementById("cancelMitraProfilBtn");

  const inputs = MITRA_PROFIL_FIELD_IDS.map((id) =>
    document.getElementById(id),
  ).filter(Boolean);

  function writeMitraProfile(data) {
    try {
      localStorage.setItem(MITRA_PROFIL_STORAGE_KEY, JSON.stringify(data));

      const existingUserProfile = safeJsonParse(
        localStorage.getItem(PROFIL_STORAGE_KEY),
        {},
      );
      localStorage.setItem(
        PROFIL_STORAGE_KEY,
        JSON.stringify({
          ...existingUserProfile,
          instansiUniversitas:
            data.namaResmiInstansi ||
            DEFAULT_MITRA_PROFIL_DUMMY.namaResmiInstansi,
        }),
      );
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }

  function readMitraProfile() {
    const raw = safeJsonParse(
      localStorage.getItem(MITRA_PROFIL_STORAGE_KEY),
      null,
    );
    if (raw && typeof raw === "object" && Object.keys(raw).length > 0) {
      return { ...DEFAULT_MITRA_PROFIL_DUMMY, ...raw };
    }
    writeMitraProfile(DEFAULT_MITRA_PROFIL_DUMMY);
    return { ...DEFAULT_MITRA_PROFIL_DUMMY };
  }

  function populateForm(data) {
    inputs.forEach((input) => {
      input.value = data[input.id] ?? "";
    });
  }

  function collectFormData() {
    const result = {};
    inputs.forEach((input) => {
      result[input.id] = input.value.trim();
    });
    return result;
  }

  function setEditing(isEditing) {
    inputs.forEach((input) => {
      const box = input.closest(".profil-field-box");
      if (isEditing) {
        input.removeAttribute("readonly");
        box?.classList.add("is-editable");
      } else {
        input.setAttribute("readonly", "readonly");
        box?.classList.remove("is-editable");
      }
    });

    editBtn?.classList.toggle("d-none", isEditing);
    saveBtn?.classList.toggle("d-none", !isEditing);
    cancelBtn?.classList.toggle("d-none", !isEditing);

    if (isEditing && inputs[0]) {
      inputs[0].focus();
    }
  }

  populateForm(readMitraProfile());
  setEditing(false);

  if (editBtn) {
    editBtn.addEventListener("click", function () {
      setEditing(true);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      populateForm(readMitraProfile());
      setEditing(false);
      showBeasifyToast("Perubahan profil mitra dibatalkan.");
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const updatedData = collectFormData();
    writeMitraProfile(updatedData);
    populateForm(updatedData);
    setEditing(false);
    showBeasifyToast("Data profil mitra berhasil disimpan!");
  });
}

// ========================================
// SINKRONISASI QUICK MENU / SIDEBAR MITRA
// ========================================
function initMitraQuickMenu() {
  const sidebarNav =
    document.querySelector(
      "#sidebarAlurMitra .offcanvas-body nav.alur-mitra-nav",
    ) || document.querySelector("#sidebarAlurMitra .offcanvas-body nav");

  if (sidebarNav) {
    const isProfilePage =
      Boolean(document.getElementById("mitraProfilForm")) ||
      (window.location.pathname || "").toLowerCase().includes("profile-mitra");

    sidebarNav.innerHTML = `
      <a href="dashboard-mitra.html" id="navDashboardMitra" class="sidebar-nav-btn alur-mitra-link ${!isProfilePage ? "active" : ""}">Dashboard Mitra</a>
      <a href="profile-mitra.html" id="navProfilMitra" class="sidebar-nav-btn alur-mitra-link ${isProfilePage ? "active" : ""}">Profil</a>
    `;
  }

  const brandLogoLink = document.querySelector(".navbar-logo");
  if (brandLogoLink) {
    brandLogoLink.setAttribute("href", "dashboard-mitra.html");
  }
}

// ========================================
// INISIALISASI TERPISAH PER ALUR
// ========================================
function initSobatFlow() {
  initStickyHeader();
  initFloatingSearchSection();
  initSidebarHamburgerSobat();
  initScholarshipFilter();
  initBerandaBookmarks();
  initFocusedDetailPage();
  initChecklistDokumen();
  initBookmarkPage();
  initRiwayatApplyPage();
  initProfilPage();
}

function initMitraFlow() {
  initStickyHeader();
  initSidebarHamburgerMitra();
  initMitraLoginRedirect();
  initMitraDashboardPage();
  initMitraProfilPage();
  initMitraQuickMenu();
}

function initAllModules() {
  if (hasMitraContext()) {
    initMitraFlow();
  } else {
    initSobatFlow();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAllModules);
} else {
  initAllModules();
}
