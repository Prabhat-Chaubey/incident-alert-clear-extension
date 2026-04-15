chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "storeIncident") {
    chrome.storage.local.get({clearedIncidents: []}, (result) => {
      const updated = result.clearedIncidents.concat([msg.data]);
      chrome.storage.local.set({clearedIncidents: updated});
    });
  }
  if (msg.type === "clearIncidents") {
    chrome.storage.local.set({clearedIncidents: []});
  }
});
