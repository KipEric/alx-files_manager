import DBClient from './utils/db';
import Bull from 'bull';
import { ObjectId } from 'mongodb';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';

const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

const createImageThumbnail = async (path, options) => {
  try {
    const thumbnail = await imageThumbnail(path, options);
    const pathNail = `${path}_${options.width}`;
    await fs.promises.writeFile(pathNail, thumbnail);
  } catch (error) {
    console.error(error);
  }
};

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;
  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const fileDocument = await DBClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
  if (!fileDocument) throw new Error('File not found');

  await Promise.all([
    createImageThumbnail(fileDocument.localPath, { width: 500 }),
    createImageThumbnail(fileDocument.localPath, { width: 250 }),
    createImageThumbnail(fileDocument.localPath, { width: 100 }),
  ]);
});

userQueue.process(async (job) => {
  const { userId } = job.data;
  if (!userId) throw new Error('Missing userId');

  const userDocument = await DBClient.db.collection('users').findOne({ _id: ObjectId(userId) });
  if (!userDocument) throw new Error('User not found');

  console.log(`Welcome ${userDocument.email}`);
});
