import { PrismaClient } from "@prisma/client";
const ethUtil = require("ethereumjs-util");
const sigUtil = require("@metamask/eth-sig-util");

const prisma = new PrismaClient();

function getChainId({ chainName }) {
  let chainId;
  if (chainName === "localhost") {
    chainId = 1337;
  } else if (chainName === "maticmum") {
    chainId = 80001;
  } else if (chainName === "matic") {
    chainId = 137;
  } else {
    chainId = 0;
  }
  return chainId;
}

export default async function handler(req, res) {
  console.log("call /api/update-metadata");

  const AUTHENTICATED_ADDRESS = "0x3851dacd8fa9f3eb64d69151a3597f33e5960a2f";

  //* Check method error.
  if (req.method !== "POST") {
    console.log("req.method: ", req.method);
    res.status(500).json({ error: "Invalid method. Support only POST." });
    return;
  }

  //* Required fields in body: jsonList, signature
  const { jsonList, signature } = req.body;
  console.log("jsonList: ", jsonList);
  console.log("signature: ", signature);

  //* Check signature address.
  const chainId = getChainId({
    chainName: process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK,
  });
  // console.log("chainId: ", chainId);

  const msgParams = JSON.stringify({
    domain: {
      chainId: chainId,
      name: "Realbits",
    },

    //* Defining the message signing data content.
    message: {
      contents: "Authenticate user with signature.",
    },

    //* Refers to the keys of the *types* object below.
    primaryType: "Login",

    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "chainId", type: "uint256" },
      ],
      //* Refer to PrimaryType
      Login: [{ name: "contents", type: "string" }],
    },
  });

  let recovered;
  try {
    recovered = sigUtil.recoverTypedSignature({
      data: JSON.parse(msgParams),
      signature: signature,
      version: sigUtil.SignTypedDataVersion.V3,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
  console.log("recovered: ", recovered);
  // console.log("publicAddress: ", publicAddress);

  //* Handle authentication error later.
  if (
    ethUtil.toChecksumAddress(recovered) !==
    ethUtil.toChecksumAddress(AUTHENTICATED_ADDRESS)
  ) {
    console.error("Recovered address is not the same as input address.");
    return res
      .status(401)
      .json({ error: "Signature authentication verification failed." });
  }

  //* Delete all avatar record.
  const deleteAvatars = await prisma.avatar.deleteMany({});
  console.log("deleteAvatars: ", deleteAvatars);

  //* Update avatar record.
  const promises = jsonList.map(async (element) => {
    console.log("element: ", element);
    console.log("element.attributes: ", element.attributes);

    //* Get each attribute.
    let hair,
      face,
      top,
      middle,
      side,
      bottom,
      body,
      body_top,
      body_bottom,
      background;
    const attributePromises = element.attributes.map((attribute) => {
      switch (attribute.trait_type) {
        case "Hair":
          hair = attribute.value;
          break;
        case "Face":
          face = attribute.value;
          break;
        case "Top":
          top = attribute.value;
          break;
        case "Middle":
          middle = attribute.value;
          break;
        case "Side":
          side = attribute.value;
          break;
        case "Bottom":
          bottom = attribute.value;
          break;
        case "Body":
          body = attribute.value;
          break;
        case "Body_Top":
          body_top = attribute.value;
          break;
        case "Body_Bottom":
          body_bottom = attribute.value;
          break;
        case "Background":
          background = attribute.value;
          break;
      }
    });
    await Promise.all(attributePromises);

    const result = await prisma.avatar.create({
      data: {
        nftAddressWithTokenId: `${element.nftAddress}/${element.tokenId}`,
        nftAddress: element.nftAddress,
        tokenId: element.tokenId,
        name: element.name,
        symbol: element.symbol,
        description: element.description,
        imageUrl: element.image,
        gltUrl: element.realbits.glb_url,
        vrmUrl: element.realbits.vrm_url,
        hair: hair,
        face: face,
        top: top,
        middle: middle,
        side: side,
        bottom: bottom,
        body: body,
        body_top: body_top,
        body_bottom: body_bottom,
        background: background,
      },
    });
  });
  await Promise.all(promises);

  //* TODO: Check error later.
  res.status(200).json({ data: "ok" });
}
