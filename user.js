const { initDb } = require("./initDbConnection");
const { getRandomSize } = require("./getRandomSize");

exports.roll = async (ctx) => {
  const db = await initDb();
  const UserModel = db.collection("users");

  const userData = {
    userId: `${ctx.message.from.id}`,
    chatId: `${ctx.message.chat.id}`,
  };

  const user = await UserModel.findOne(userData);
  const randomSize = getRandomSize();

  if (!user) {
    const {
      ops: [createdUser],
    } = await UserModel.insertOne({
      ...userData,
      updatedAt: new Date(),
      size: randomSize,
    });

    ctx.telegram.sendMessage(
      userData.chatId,
      `Вітаю, ${ctx.message.from.username}!
Тепер ти в грі!
Твій cum-пулемет при народженні був: ${createdUser.size}cм`
    );
    return;
  }

  if (new Date(user.updatedAt).getTime() > new Date().setHours(0, 0, 0, 0)) {
    ctx.telegram.sendMessage(
      userData.chatId,
      `Твій михайло-молодший сьогодні вже качався!`
    );
    return;
  }

  const newDickUser = await UserModel.findOneAndUpdate(userData, {
    $set: {
      ...userData,
      updatedAt: new Date(),
      size: user.size + randomSize,
    },
  });

  ctx.telegram.sendMessage(
    userData.chatId,
    `Твоя сарделька ${
      randomSize > 0
        ? `збільшилась на ${randomSize}см`
        : "лишилась такою самою :("
    }.
Вона теперь: ${user.size + randomSize}см;`
  );
  return;
};

exports.top = async (ctx) => {
  const db = await initDb();
  const UserModel = db.collection("users");

  const users = await UserModel.find({
    chatId: `${ctx.message.chat.id}`,
  })
    .sort({ size: -1 })
    .toArray();


  const members = await Promise.all(
    users.map((user) => ctx.telegram.getChatMember(+user.chatId, +user.userId))
  );
  members.map((member, i) => {
    users[i].name = member.user.first_name;
  });
  ctx.telegram.sendMessage(
    ctx.message.chat.id,
    (({ users }) => {
      let responseStr = "";
      users.forEach((user, i) => {
        responseStr = responseStr + `${i + 1}. ${user.name}: ${user?.size}cм\n`;
      });
      return responseStr;
    })({ users }),
    {
      reply_to_message_id: ctx.message.message_id,
    }
  );
  return;
};

exports.me = async (ctx) => {
  const db = await initDb();
  const UserModel = db.collection("users");

  const userData = {
    userId: `${ctx.message.from.id}`,
    chatId: `${ctx.message.chat.id}`,
  };

  const user = await UserModel.findOne(userData);
  if (!user) {
    ctx.telegram.sendMessage(userData.chatId, `Зареєструйся в грі! /roll`);
    return;
  }
  ctx.telegram.sendMessage(
    userData.chatId,
    `Твій шампур у бойовому положенні aж ${user.size} см`
  );
  return;
};
