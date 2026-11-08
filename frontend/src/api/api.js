const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "The request could not be completed.");
  }
  if (response.status === 204) return null;
  return response.json();
}

export function processAudio(formData) {
  return request("/speech/process", { method: "POST", body: formData });
}

export async function generateVoice(text, language) {
  const response = await fetch(`${API_URL}/speech/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Voice generation failed.");
  }

  return response.blob();
}

export function saveResult(data) {
  return request("/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export function getHistory() {
  return request("/history");
}

export function deleteHistoryItem(id) {
  return request(`/history/${id}`, { method: "DELETE" });
}

export function clearAllHistory() {
  return request("/history", { method: "DELETE" });
}
