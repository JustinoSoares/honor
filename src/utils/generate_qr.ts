import  QRCode  from "qrcode";
//const QRCode = require("qrcode");

import dotenv from "dotenv";
dotenv.config();




export async function generateUserQRCode(inviteId: string): Promise<string> {
  try {
    const dataToEncode = String(inviteId); // não precisa do JSON.stringify
    const svg = await QRCode.toString(dataToEncode, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 256, // opcional
    });
    return svg; // markup SVG
  } catch (error) {
    throw new Error('Erro ao gerar QR Code (SVG): ' + error);
  }
}