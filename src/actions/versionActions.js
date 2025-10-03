import axios from 'axios';

const baseURL = `${process.env.REACT_APP_IP}/api/version`;
// const baseURL = 'http://localhost:5000/api/version';

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true
});

instance.interceptors.response.use(
  response => {
    // If the response is successful, just return the response
    return response;
  },
  error => {
    // If the response has a status code of 401, redirect to the login page
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    }
    // Otherwise, reject the promise with the error object
    return Promise.reject(error);
  }
);


export const firmwareReleaseNotes = async () => {
  try {
    const response = await instance.get('/firmware-releases');
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
}

export const emsReleaseNotes = async () => {
  try {
    const response = await instance.get('/ems-releases');
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
}

export const vmsReleaseNotes = async () => {
  try {
    const response = await instance.get('/vms-releases');
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
}

export const uploadVersionRelease = async (versionName, versionNo, productType = 'S-Series', ltsVersion, files, updates = []) => {
  try {
    // Prepare FormData
    const formData = new FormData();
    formData.append("versionNo", versionNo);
    formData.append("versionName", versionName);
    formData.append("productType", productType);
    formData.append("ltsVersion", ltsVersion);
    formData.append("updates", JSON.stringify(updates));

    // Append multiple files
    files.forEach((file) => {
      formData.append("file", file);
    });
    const response = await instance.post(`/create-or-update-firmware-release/${versionNo}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" }
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Upload failed:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Upload failed"
    };
  }
};

export const downloadVersionReleaseFile = async (versionNo, filename) => {
  try {
    const response = await instance.get(`/versionRelease/${versionNo}/${filename}`,
      { responseType: "blob" } // to handle binary files
    );

    // Create blob URL
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Download failed:", error);
    return {
      success: false,
      message: error.response?.data?.error || "Download failed"
    };
  }
};


// Base Firmware Code

export const getAllFirmware = async () => {
  try {
    const res = await instance.get(`/firmware/getAllFirmware`);
    return res.data;
  } catch (err) {
    console.error("Firmware fetch failed:", err);
    throw err;
  }
};

export const uploadFirmware = async (cameraName, versionName, binFile, romFile, releaseNotesFile) => {
  try {
    const formData = new FormData();
    formData.append("cameraName", cameraName);
    formData.append("versionName", versionName);
    formData.append("firmwareFiles", binFile);
    formData.append("firmwareFiles", romFile);
    formData.append("releaseNotes", releaseNotesFile);

    const res = await instance.post(`/firmware/${cameraName}/${versionName}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  } catch (err) {
    console.error("Firmware upload failed:", err);
    throw err;
  }
};

export const downloadFirmwareById = async (id, type) => {
  try {
    console.log("Downloading firmware/release notes | id:", id, "type:", type);

    // Make API request with blob response
    const response = await instance.get(
      `/firmware/download/${id}?type=${type}`,
      { responseType: "blob" } // important for binary files
    );

    // Determine filename from Content-Disposition header
    let filename = "download";
    const disposition = response.headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
      filename = disposition
        .split("filename=")[1]
        .replace(/["']/g, "")
        .trim();
    } else if (type === "releaseNotes") {
      filename = "releaseNotes.txt";
    } else if (type === "firmware") {
      filename = "firmwareFiles.zip";
    }

    // Create blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Firmware download failed:", error);

    // Check if backend sent JSON error instead of file
    let message = "Download failed";
    if (error.response && error.response.data) {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result;
          console.error("Backend response:", text);
        };
        reader.readAsText(error.response.data);
      } catch (e) { }
      message = error.response.data?.message || message;
    }

    return { success: false, message };
  }
};
