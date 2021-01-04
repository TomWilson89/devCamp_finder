import NodeGeoCoder from "node-geocoder";
import dotenv from "dotenv";

dotenv.config();

const options: any = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = NodeGeoCoder(options);

export default geocoder;
