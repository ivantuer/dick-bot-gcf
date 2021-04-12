const { initDb } = require("./initDbConnection");
const { getRandomSize } = require("./getRandomSize");
const { getName } = require("./getName");

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
      username: ctx.message.from.username,
      firstName: ctx.message.from.first_name,
      lastName: ctx.message.from.last_name,
    });

    ctx.telegram.sendMessage(
      userData.chatId,
      `Вітаю, ${ctx.message.from.username}!
Тепер ти в грі!
Твій cum-пулемет при народженні був: ${createdUser.size}cм`
    );
    return;
  }

  if (new Date(user.updatedAt).getTime() > new Date().setHours(3, 0, 0, 0)) {
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
      username: ctx.message.from.username,
      firstName: ctx.message.from.first_name,
      lastName: ctx.message.from.last_name,
    },
  });

  ctx.telegram.sendMessage(
    userData.chatId,
    `Твоя сарделька ${
      randomSize > 0
        ? `збільшилась на ${randomSize}см`
        : "лишилась такою самою :("
    }.
Вона теперь: ${user.size + randomSize}см;`,
    {
      reply_to_message_id: ctx.message.message_id,
    }
  );
  return;
};

exports.top = async (ctx) => {
  try {
    console.log(ctx.message.from.id);
    const db = await initDb();
    const UserModel = db.collection("users");

    const users = await UserModel.find({
      chatId: `${ctx.message.chat.id}`,
    })
      .sort({ size: -1 })
      .toArray();

    ctx.telegram.sendMessage(
      ctx.message.chat.id,
      (({ users }) => {
        let responseStr = "";
        users.forEach((user, i) => {
          responseStr =
            responseStr +
            `${i + 1}. ${
              user.username || `${user.firstName || ""} ${user.lastName || ""}`
            }: ${user?.size}cм\n`;
        });
        return responseStr;
      })({ users }),
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } catch (err) {
    ctx.telegram.sendMessage(
      ctx.message.chat.id,
      Math.random() > 0.5
        ? "Підараси бота зламали!"
        : "Чтобы восстановить пароль, подготовьте номер паблик стейтик джава точка ланг точка обджект ру точка тиньков ангшенс точка аф джава точка ланг точка буллин джава..."
    );
  }

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

exports.sex = async (ctx) => {
  const db = await initDb();
  const UserModel = db.collection("users");
  const SexModel = db.collection("sex");

  const userData = {
    userId: `${ctx.message.from.id}`,
    chatId: `${ctx.message.chat.id}`,
  };

  const [activeUser] = await UserModel.aggregate([
    { $match: { chatId: userData.chatId } },
    { $sample: { size: 1 } },
  ]).toArray();

  const [passiveUser] = await UserModel.aggregate([
    {
      $match: { userId: { $ne: activeUser.userId }, chatId: userData.chatId },
    },
    { $sample: { size: 1 } },
  ]).toArray();

  const sexTodayCouple = await SexModel.findOne({
    updatedAt: {
      $gte: new Date(new Date().setHours(3, 0, 0, 0)),
    },
    chatId: userData.chatId,
  });

  if (!activeUser) {
    ctx.telegram.sendMessage(userData.chatId, `А в тебе хуя нема(`, {
      reply_to_message_id: ctx.message.message_id,
    });
    return;
  }

  if (!passiveUser) {
    ctx.telegram.sendMessage(userData.chatId, `Нема з ким трахаця(`, {
      reply_to_message_id: ctx.message.message_id,
    });
    return;
  }

  if (sexTodayCouple) {
    ctx.telegram.sendMessage(
      userData.chatId,
      `Сьогодні ${getName(sexTodayCouple.activeUser)} жостко виїбав ${getName(
        sexTodayCouple.passiveUser
      )} ${sexTodayCouple.count} раз!`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  } else {
    ctx.telegram.sendMessage(userData.chatId, `Починається єбля!!!`, {
      reply_to_message_id: ctx.message.message_id,
    });

    const {
      ops: [createdSex],
    } = await SexModel.insertOne({
      activeUser,
      passiveUser,
      updatedAt: new Date(),
      count: getRandomSize(),
      chatId: userData.chatId,
    });

    ctx.telegram.sendMessage(
      userData.chatId,
      `За результатами секса, попка ${getName(createdSex.passiveUser)} ${
        createdSex.count
      } раз сильно пострадала від ${getName(createdSex.activeUser)}!!`,
      {
        reply_to_message_id: ctx.message.message_id,
      }
    );
  }
  return;
};
