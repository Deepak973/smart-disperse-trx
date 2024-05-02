import { RangoClient } from "rango-sdk-basic";
// import dotenv from 'dotenv';
// dotenv.config();

// const rangoAPI = process.env.RANGO_API_KEY;
// console.log("API", rangoAPI);


export async function FetchMeta() {
    const rangoClient = new RangoClient("95ef894a-f8f0-4eb4-90f7-f8559896474a");
    const meta = await rangoClient.meta();
    return meta;
    console.log(meta);
}


