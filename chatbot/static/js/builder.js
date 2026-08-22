/**
 * Globe Trotter - Itinerary Builder & Dynamic Timeline Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  const tripId = window.CURRENT_TRIP_ID;
  if (!tripId) return;

  // Day Filter Tabs
  const dayTabs = document.querySelectorAll(".day-filter-tab");
  const activityItems = document.querySelectorAll(".activity-card-wrapper");

  dayTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      dayTabs.forEach((t) => {
        t.classList.remove("bg-sky-600", "text-white", "shadow-sm");
        t.classList.add("bg-white", "text-slate-600", "hover:bg-slate-100");
      });
      tab.classList.remove("bg-white", "text-slate-600", "hover:bg-slate-100");
      tab.classList.add("bg-sky-600", "text-white", "shadow-sm");

      const selectedDate = tab.dataset.date;
      activityItems.forEach((item) => {
        if (selectedDate === "all" || item.dataset.date === selectedDate) {
          item.classList.remove("hidden");
        } else {
          item.classList.add("hidden");
        }
      });
    });
  });

  // Modal Open / Close Helpers
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  };

  // Add Stop Modal Prep
  window.prepareAddStopModal = function (prefillCity = "", prefillCountry = "", costIndex = 3) {
    const cityInput = document.getElementById("stop-city-input");
    const countryInput = document.getElementById("stop-country-input");
    const costSelect = document.getElementById("stop-cost-select");

    if (cityInput) cityInput.value = prefillCity;
    if (countryInput) countryInput.value = prefillCountry;
    if (costSelect) costSelect.value = costIndex;

    openModal("add-stop-modal");
  };

  // Add Activity Modal Prep
  window.prepareAddActivityModal = function (stopId, defaultDate = "") {
    const stopInput = document.getElementById("activity-stop-id-input");
    const dateInput = document.getElementById("activity-date-input");

    if (stopInput) stopInput.value = stopId;
    if (dateInput && defaultDate) dateInput.value = defaultDate;

    openModal("add-activity-modal");
  };

  // Add Stop Form Submit
  const addStopForm = document.getElementById("add-stop-form");
  if (addStopForm) {
    addStopForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(addStopForm);

      try {
        const res = await fetch(`/trips/${tripId}/stops/add`, {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          closeModal("add-stop-modal");
          window.location.reload();
        } else {
          alert(data.error || "Failed to add stop.");
        }
      } catch (err) {
        console.error(err);
        alert("Network error adding stop.");
      }
    });
  }

  // Add Activity Form Submit
  const addActivityForm = document.getElementById("add-activity-form");
  if (addActivityForm) {
    addActivityForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const stopId = document.getElementById("activity-stop-id-input").value;
      if (!stopId) return;

      const formData = new FormData(addActivityForm);

      try {
        const res = await fetch(`/stops/${stopId}/activities/add`, {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          closeModal("add-activity-modal");
          window.location.reload();
        } else {
          alert(data.error || "Failed to add activity.");
        }
      } catch (err) {
        console.error(err);
        alert("Network error adding activity.");
      }
    });
  }

  // Toggle Activity Completion
  document.querySelectorAll(".activity-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", async (e) => {
      const actId = checkbox.dataset.activityId;
      const cardTitle = document.getElementById(`act-title-${actId}`);

      try {
        const res = await fetch(`/activities/${actId}/toggle-complete`, { method: "POST" });
        const data = await res.json();
        if (data.success) {
          if (cardTitle) {
            if (data.is_completed) {
              cardTitle.classList.add("line-through", "text-slate-400");
            } else {
              cardTitle.classList.remove("line-through", "text-slate-400");
            }
          }
          // Update completed count badge if present
          const counter = document.getElementById("completed-activities-badge");
          if (counter && data.total_count) {
            counter.textContent = `${data.completed_count} / ${data.total_count} Completed`;
          }
        }
      } catch (err) {
        console.error("Toggle error:", err);
      }
    });
  });

  // Delete Activity
  window.deleteActivity = async function (actId, title) {
    if (!confirm(`Remove "${title}" from this itinerary?`)) return;

    try {
      const res = await fetch(`/activities/${actId}/delete`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        const el = document.getElementById(`activity-row-${actId}`);
        if (el) el.remove();
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete activity.");
    }
  };

  // Delete Stop
  window.deleteStop = async function (stopId, cityName) {
    if (!confirm(`Delete stop "${cityName}" and all its scheduled activities?`)) return;

    try {
      const res = await fetch(`/stops/${stopId}/delete`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete stop.");
    }
  };

  // Stop Reordering (Move Up / Move Down)
  window.moveStopOrder = async function (stopId, direction) {
    const stopsListEl = document.getElementById("stops-container");
    if (!stopsListEl) return;

    const stopCards = Array.from(stopsListEl.querySelectorAll(".stop-card-container"));
    const currentIndex = stopCards.findIndex((c) => parseInt(c.dataset.stopId) === stopId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= stopCards.length) return;

    // Swap elements in DOM
    const [moved] = stopCards.splice(currentIndex, 1);
    stopCards.splice(targetIndex, 0, moved);

    const reorderedIds = stopCards.map((c) => parseInt(c.dataset.stopId));

    try {
      const res = await fetch(`/trips/${tripId}/stops/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stop_ids: reorderedIds })
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Reorder failed:", err);
    }
  };

  // AI Prompt Helper for a specific stop
  window.askAIForStop = function (cityName, country) {
    if (window.openTravelAI) {
      window.openTravelAI(`What are the top hidden gems, local street food spots, and transit hacks for ${cityName}, ${country}?`);
    }
  };
});
