import axios from "axios";
const uri = "http://api.quotable.io/random";

export const getQuotesData = () => {
  return axios.get(uri).then((response) => response.data.content.split(" "));
};
