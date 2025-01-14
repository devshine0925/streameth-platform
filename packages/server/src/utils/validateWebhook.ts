import { config } from '@config';
import { RemotionPayload } from '@interfaces/remotion.webhook.interface';
import crypto from 'crypto';

export function validateRemotionWebhook(
  remotionSignature: string,
  payload: RemotionPayload,
): boolean {
  const signature = crypto
    .createHmac('sha512', config.remotion.webhookSecretKey)
    .update(JSON.stringify(payload))
    .digest('hex');
  if (remotionSignature !== signature) return false;
  return true;
}

export function validateWebhook(
  livepeerSignature: string,
  payload: any,
): boolean {
  const elements = livepeerSignature.split(',');
  const signatureParts = elements.reduce((acc, element) => {
    const [key, value] = element.split('=');
    acc[key] = value;
    return acc;
  }, {});

  const timestamp = signatureParts['t'];
  const signature = signatureParts['v1'];
  const signedPayload = JSON.stringify(payload);

  const expectedSignature = crypto
    .createHmac('sha256', config.livepeer.webhookSecretKey)
    .update(signedPayload)
    .digest('hex');

  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );

  if (!isSignatureValid) {
    return false;
  }

  const tolerance = 8 * 60 * 1000; // 8 minutes in milliseconds
  const currentTime = Date.now(); // Current time in milliseconds
  const isTimestampValid =
    Math.abs(currentTime - parseInt(timestamp, 10)) < tolerance;

  if (!isTimestampValid) {
    return false;
  }

  return true;
}
