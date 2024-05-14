import { NextResponse } from "next/server";
import { RangoClient, TransactionStatus } from "rango-sdk-basic";

// export async function GET(req) {
//   let data = [];
//   console.log("Connecting to MongoDB...");

//   const { searchParams } = new URL(req.url);
//   const address = searchParams.get("address");
//   console.log(address);
//   try {
//     await mongoose.connect(process.env.MONGODB_URL);
//     console.log("Connected to MongoDB!!");
//     data = await smartdisperse_data.find({
//       userid: address,
//     });
//     console.log("smart disperse data:", data);
//   } catch (err) {
//     return new Response("Error connecting to the database", { status: 503 });
//   }
//   return NextResponse.json({ result: data });
// }

export async function POST(request) {
  try {
    const rangoClient = new RangoClient("95ef894a-f8f0-4eb4-90f7-f8559896474a");
    const payload = await request.json();
    console.log("payload:", payload);
    const swap = await rangoClient.swap(payload.requestData);
    console.log(swap);

    return NextResponse.json({ swapData: swap });
  } catch (err) {
    console.log(err);
    return new Response("Error connecting to the database", { status: 503 });
  }
  return new Response("Success", { status: 200 });
}
