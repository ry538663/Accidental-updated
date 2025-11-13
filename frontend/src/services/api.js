// API service for incident management
const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8000/api";

export const incidentAPI = {
  // Create a new incident
  create: async (incidentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // include new structured fields expected by backend
          type: incidentData.type,
          location: incidentData.location,
          description: incidentData.description,
          caller_name: incidentData.caller_name,
          caller_phone: incidentData.caller_phone,
          patient_lat: incidentData.patient_lat,
          patient_lng: incidentData.patient_lng,
          hardware_sensor_id: incidentData.hardware_sensor_id,
          emergency_level: incidentData.emergency_level,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating incident:", error);
      throw error;
    }
  },

  // Get all incidents
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching incidents:", error);
      throw error;
    }
  },

  // Update an incident
  update: async (id, incidentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incidentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating incident:", error);
      throw error;
    }
  },

  // Delete an incident
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting incident:", error);
      throw error;
    }
  },
};

// Hospital related client calls
export const hospitalAPI = {
  lookupNearest: async ({ lat, lng, emergency_level, max_results = 5 }) => {
    const resp = await fetch(`${API_BASE_URL}/hospitals/lookup-nearest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng, emergency_level, max_results }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  },

  reserveBed: async (hospital_id, payload) => {
    const resp = await fetch(
      `${API_BASE_URL}/hospitals/${hospital_id}/reserve-bed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
  },
};

// API service for ambulance tracking
export const ambulanceAPI = {
  // Set destination for ambulance
  setDestination: async (lat, lng) => {
    try {
      const response = await fetch(`${API_BASE_URL}/set-destination`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lat, lng }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error setting destination:", error);
      throw error;
    }
  },

  // Get current route
  getRoute: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-route`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting route:", error);
      throw error;
    }
  },
};
