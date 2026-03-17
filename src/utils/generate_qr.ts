import QRcode from 'qrcode';

export async function generateQRCode(guest_id: string): Promise<string | null> {
  try {
    const qrCodeDataURL = await QRcode.toString(guest_id,{
        type: 'svg',
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}