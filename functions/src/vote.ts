import * as admin from "firebase-admin";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const db = admin.firestore();

const collection = db.collection("vote");

export const getAllVotes = async () => {
  const snapshot = await collection.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Record<string, any>
    & { chatId: number, id: string, val: number, name: string }));
};

export const addVote = async (id: number,
    chatId: number,
    name: string,
    val: number) => {
  const doc = await collection.doc(`${id}`).get();

  const data = doc.data();

  if (!doc.exists || !data) {
    return collection.doc(`${id}`).set({
      chatId,
      name,
      val,
      count: 1,
    }).then(() => 1);
  } else {
    const {count} = data;
    if (isNaN(count) || count <= 1) {
      return collection.doc(`${id}`).set({
        chatId,
        name,
        val,
        count: 2,
      }).then(() => 2);
    }
    return undefined;
  }
};
