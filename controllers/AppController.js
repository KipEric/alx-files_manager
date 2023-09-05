import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static async getStatus(request, response) {
    try {
      const redis = await redisClient.isAlive();
      const db = await dbClient.isAlive();
      response.status(200).send({ redis, db });
    } catch (error) {
      console.error(error);
      response.status(500).send({ error: 'Server error' });
    }
  }

  static async getStats(request, response) {
    try {
      const users = await dbClient.nbUsers();
      const files = await dbClient.nbFiles();
      response.status(200).send({ users, files });
    } catch (error) {
      console.error(error);
      response.status(500).send({ error: 'Server error' });
    }
  }
}

export default AppController;
