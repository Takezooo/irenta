import axios from "axios";

import { GetToken } from "../global/utils/Token";
const API_BASE_URL = "http://localhost:5000/api/listings"; // Update with your backend API endpoint

export const fetchListings = async () => {
  try {
    const { data } = await axios.get(API_BASE_URL);
    return data;
  } catch (err) {
    console.error("Failed to fetch listings:", err);
  }
};
