import axios from "axios";
import Cookies from "js-cookies";

export default class api {
  // Same origin in production (the server serves this app). Override with VITE_API_URL if needed.
  static url = import.meta.env.VITE_API_URL || "/api";
  static token = Cookies.getItem("token");
  static async resetPassword(password) {
    const { data } = await axios.patch(
      `${api.url}/user/reset-password`,
      { password },
      {
        headers: {
          token: Cookies.getItem("token"),
        },
      }
    );
    return true;
  }
  static async searchByImage(image) {
    const formData = new FormData();
    formData.append("file", image);
    const response = await axios.post(
      `${api.url}/place/search-by-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          token: Cookies.getItem("token"),
        },
      }
    );
    return response;
  }
  static async getReveiws(placeId) {
    const { data } = await axios.get(
      `${api.url}/user/get-reviews?placeId=${placeId}`,
      {
        headers: {
          token: Cookies.getItem("token"),
        },
      }
    );
    return data;
  }
  static async postReview(review, placeId) {
    const { data } = await axios.post(
      `${api.url}/user/review-place`,

      {
        review,
        placeId,
      },
      {
        headers: {
          token: Cookies.getItem("token"),
        },
      }
    );
    return data;
  }
  static async getUserLocation() {
    // HTTPS providers only (plain http is blocked on an https site)
    try {
      const { data } = await axios.get("https://get.geojs.io/v1/ip/geo.json");
      return [Number(data.latitude), Number(data.longitude)];
    } catch (err) {
      const { data } = await axios.get("https://ipapi.co/json/");
      return [Number(data.latitude), Number(data.longitude)];
    }
  }
  static async signup({ userName, email, password }) {
    return await axios.post(`${api.url}/user/signup`, {
      userName,
      email,
      password,
    });
  }

  static async login({ userName, password }) {
    let response = await axios.get(
      `${api.url}/user/login?userName=${userName}`,
      {
        headers: {
          password,
        },
      }
    );
    return response;
  }

  static async validateToken(token) {
    return await axios.get(`${api.url}/user/validate-token`, {
      headers: {
        token: Cookies.getItem("token"),
      },
    });
  }

  static async get_code(email) {
    const { data } = await axios.get(
      `${api.url}/user/recover-account?email=${email}`
    );
    if (!data.success) throw new Error(data.message);
  }

  static async submit_code(code, email) {
    const { data } = await axios.post(`${api.url}/user/recover-account`, {
      email,
      verificationCode: code,
    });
    if (!data.success) throw new Error(data.message);
    return data;
  }

  static async getUser(token) {
    const { data } = await axios.get(api.url + "/user/send-account", {
      headers: { token: Cookies.getItem("token") },
    });
    if (!data.success) throw new Error(data.message);
    return data;
  }

  static async searchPlaces(
    searchQuery,
    selectedCities,
    selectedTypes,
    unit,
    radius,
    userLat,
    userLng
  ) {
    let citiesQuery = "";
    let typesQuery = "";
    for (let i = 0; i < selectedCities.length; i++) {
      if (i === 0) {
        citiesQuery = selectedCities[i];
        continue;
      }
      citiesQuery = citiesQuery + "," + selectedCities[i];
    }
    for (let i = 0; i < selectedTypes.length; i++) {
      if (i === 0) {
        typesQuery = selectedTypes[i];
        continue;
      }
      typesQuery = typesQuery + "," + selectedTypes[i];
    }

    const { data } = await axios.get(
      api.url +
        `/place/search-places?search=${searchQuery}&cities=${citiesQuery}&types=${typesQuery}&radius=${radius}&unit=${unit}&userLat=${userLat}&userLng=${userLng}`,
      {
        headers: { token: Cookies.getItem("token") }, // Add token header
      }
    );
    return data.results;
  }

  // Direct URL for an <img>. The server redirects it to R2 in production.
  static imageUrl(placeId, photoReference) {
    return `${api.url}/place/image?photoReference=${encodeURIComponent(
      photoReference
    )}&placeId=${encodeURIComponent(placeId)}`;
  }

  static async getImage(placeId, photoReference) {
    const url = `${api.url}/place/image?photoReference=${photoReference}&placeId=${placeId}`;
    const res = await axios.get(url, {
      responseType: "blob",
      headers: {
        token: Cookies.getItem("token"),
      },
    });
    // if (!res.success)
    // return
    return res.data;
  }
}
