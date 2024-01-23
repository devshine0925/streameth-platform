import { createLabels, createSummary, createTranscription } from "./ai";
import { getAssetInfo } from "../../../av-tools/src/utils/livepeer";
import { downloadM3U8ToMP3 } from "../../../av-tools/src/utils/ffmpeg";
import S3Client from "../../../server/services/s3/index.ts";
import SessionService from "../../../new-server/src/services/session.service";
import * as fs from "fs";
import { join } from "path";

const BUCKET_NAME = "streamethapp";
const TRANSCRIPTIONS_PATH = "transcriptions/";
const TMP_MP3_PATH = "./tmp/mp3/";
const TMP_TRANSCRIPTIONS_PATH = "./tmp/transcriptions/";
const TMP_SUMMARY_PATH = "./tmp/summary/";

async function getFileSize(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      }
      resolve(stats.size);
    });
  });
}

async function startCreatingSummary(
  assetId: string,
  overwriteFiles = false,
  keepTmp = false
) {
  if (!assetId) {
    throw new Error("Invalid asset ID");
  }

  const assetInfo = await getAssetInfo(assetId);
  if (!assetInfo) {
    throw new Error("Asset does not exist");
  }

  const sessionService = new SessionService();
  const { sessions } = await sessionService.getAll({ assetId: assetInfo.id });
  if (sessions.length !== 1) {
    throw new Error("Something went wrong when fetching the correct session");
  }
  const session = sessions[0];

  const mp3FilePath = join(TMP_MP3_PATH, `${session.id}.mp3`);
  const transcriptionFilePath = join(
    TMP_TRANSCRIPTIONS_PATH,
    `${session.id}.txt`
  );
  const digitalOceanPath = join(TRANSCRIPTIONS_PATH, `${session.id}.txt`);

  const s3 = new S3Client();
  const data = await s3.getBucket(BUCKET_NAME, digitalOceanPath);
  if (Object.keys(data).length !== 0 && !overwriteFiles) {
    throw new Error("File already exists on Digital Ocean");
  }

  const downloadUrl = assetInfo.playbackUrl || "";
  await downloadM3U8ToMP3(downloadUrl, session.id, TMP_MP3_PATH, 9);

  const size = await getFileSize(mp3FilePath);
  if (size >= 25000000) {
    throw new Error("Audio file too big");
  }

  await createTranscription(
    mp3FilePath,
    TMP_TRANSCRIPTIONS_PATH,
    `${session.id}.txt`
  );

  if (!fs.existsSync(transcriptionFilePath)) {
    throw new Error(`${transcriptionFilePath} does not exist...`);
  }

  const fileStream = fs.createReadStream(transcriptionFilePath);
  await s3.uploadFile(BUCKET_NAME, digitalOceanPath, fileStream, "text/plain");

  const summary = await createSummary(
    transcriptionFilePath,
    TMP_SUMMARY_PATH,
    `summary-${session.id}.txt`
  );

  const labels = await createLabels(transcriptionFilePath);

  await sessionService.update(session.id, {
    videoTranscription: `https://streamethapp.ams3.cdn.digitaloceanspaces.com/transcriptions/${session.id}.txt`,
    aiDescription: summary,
    autoLabels: labels,
  });

  if (keepTmp === false) {
    fs.rmSync("./tmp", { recursive: true, force: true });
  }
}

startCreatingSummary("7a79da4e-19d4-44e1-9600-e4f927c47af9")
  .then(() => console.log("Ran successfully..."))
  .catch((err) => console.error("Error:", err));

export default startCreatingSummary;
