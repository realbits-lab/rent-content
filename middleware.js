import { NextResponse, userAgent } from "next/server";

export default function middleware(request) {
  const METAMASK_DAPP_URL = "https://metamask.app.link/dapp/";
  // const url = request.nextUrl;
  const url = "https://3ff0-124-37-4-162.jp.ngrok.io/";
  const { device } = userAgent(request);
  const requestHeaders = new Headers(request.headers);

  // Add new request headers
  const headerUserAgent = requestHeaders.get("user-agent");
  // console.log("device: ", device);
  // console.log("headerUserAgent: ", headerUserAgent);
  // console.log("request.headers: ", request.headers);
  // console.log("url: ", url);

  if (
    device.type === "mobile" &&
    headerUserAgent.includes("MetaMaskMobile") === false
  ) {
    return NextResponse.redirect(`${METAMASK_DAPP_URL}${url}`);
  }
}
