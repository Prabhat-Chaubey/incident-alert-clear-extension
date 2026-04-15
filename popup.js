function renderResults() {
  chrome.storage.local.get({clearedIncidents: []}, (result) => {
    const container = document.getElementById('results');
    container.innerHTML = '';
    if (result.clearedIncidents.length === 0) {
      container.innerHTML = '<p>No cleared incidents found yet.</p>';
      return;
    }
    result.clearedIncidents.forEach(inc => {
      container.innerHTML += `
        <div class="incident-row">
          <strong>INC Number:</strong> ${inc.incidentNumber}<br>
          <strong>Assigned to:</strong> ${inc.assignedTo}
        </div>
        <hr>
      `;
    });
  });
}

document.getElementById('refresh-btn').onclick = renderResults;
document.addEventListener('DOMContentLoaded', renderResults);
