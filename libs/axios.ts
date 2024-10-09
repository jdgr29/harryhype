import axios from "axios";

export const CustomAxios = axios.create({
  baseURL: "http://localhost:4000/api", //TODO account for the real one jeje
});
