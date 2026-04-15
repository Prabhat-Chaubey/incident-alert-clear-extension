// Utility: Wait for DOM ready
function waitForDOM() {
  return new Promise(resolve => {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      resolve();
    } else {

      document.addEventListener("DOMContentLoaded", resolve);
    }
  });
}

// Utility: Simulate Ctrl+Click to open in new tab
function openIncidentsInTabs() {
  const links = document.querySelectorAll('td.vt a.linked.formlink');
  links.forEach(link => {
    const evt = new MouseEvent('click', {ctrlKey: true, bubbles: true});
    link.dispatchEvent(evt);
  });
}

// Utility: Find which phrase appears first in activity stream
function findFirstPhrase() {
  const lis = document.querySelectorAll('#sn_form_inline_stream_entries ul.h-card-wrapper.activities-form > li.h-card');
  for (let li of lis) {
    const text = li.textContent;
    if (text.includes("Informed changes to Omnibus with: 200")) {
      return "omnibus";
    }
    if (text.includes("The Event Severity Changed to : Clear")) {
      return "clear";
    }
  }
  return null;
}

// Utility: Extract Incident Number and Assigned To
function extractIncidentInfo() {
  // Incident Number
  let incidentNumber = document.querySelector('#sys_readonly\\.incident\\.number')?.value ||
                       document.querySelector('#incident\\.number')?.value ||
                       document.querySelector('input[id*="incident.number"]')?.value ||
                       '';
  // Assigned To
  let assignedTo = document.querySelector('#sys_display\\.incident\\.assigned_to')?.value ||
                   document.querySelector('#incident\\.assigned_to')?.value ||
                   '';
  return {incidentNumber, assignedTo};
}

// Utility: Wait for popup and click OK
function waitForPopupAndClickOK(callback) {
  // Update these selectors if your popup/OK button is different!
  const popupSelector = '.modal, .sn-light-box, .ui-dialog, .popup'; // Add more if needed
  const okBtnSelector = 'button, .btn, .btn-primary, .btn-ok';

  let attempts = 0;
  const maxAttempts = 20; // 10 seconds if interval is 500ms

  function tryClick() {
    // Find any visible popup
    const popups = Array.from(document.querySelectorAll(popupSelector))
      .filter(popup => popup.offsetParent !== null);
    if (popups.length > 0) {
      for (const popup of popups) {
        // Try to find an OK/Yes/Confirm button
        const okBtn = Array.from(popup.querySelectorAll(okBtnSelector))
          .find(btn => /^(ok|yes|confirm)$/i.test(btn.textContent.trim()) || btn.getAttribute('aria-label')?.toLowerCase().includes('ok'));
        if (okBtn) {
          okBtn.click();
          setTimeout(callback, 500); // Wait for popup to close
          return;
        }
      }
    }
    attempts++;
    if (attempts < maxAttempts) {
      setTimeout(tryClick, 500);
    } else {
      callback(); // Proceed anyway after timeout
    }
  }
  tryClick();
}

// Main logic for incident detail page
(async function() {
  await waitForDOM();

  // If on the main list page, add a button to trigger opening all incidents
  if (document.querySelector('td.vt a.linked.formlink')) {
    if (!document.getElementById('open-all-incidents-btn')) {
      const btn = document.createElement('button');
      btn.id = 'open-all-incidents-btn';
      btn.textContent = 'Open All Incidents in Tabs';
      btn.style = 'position:fixed;top:10px;right:10px;z-index:9999;padding:10px;background:#0078d4;color:#fff;border:none;border-radius:4px;cursor:pointer;';
      btn.onclick = () => {
        chrome.runtime.sendMessage({type: "clearIncidents"});
        openIncidentsInTabs();
        alert('All incidents opened in new tabs. Please wait for processing.');
      };
      document.body.appendChild(btn);
    }
    return;
  }

  // If on an incident detail page, process the activity stream with popup handling
  waitForPopupAndClickOK(() => {
    setTimeout(() => {
      const first = findFirstPhrase();
      if (first === "clear") {
        const info = extractIncidentInfo();
        chrome.runtime.sendMessage({
          type: "storeIncident",
          data: info
        });
      }
      // If "omnibus" appears first, do nothing
    }, 1500);
  });
})();
