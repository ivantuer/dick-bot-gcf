exports.getName = (user) => {
  let name = "";
  if (user.firstName) {
    name += user.firstName;
  }
  if (user.lastName) {
    name += ` ${user.lastName}`;
  }
  if (!user.firstName && !user.lastName && user.username) {
    name += ` ${user.username}`;
  }
  return name;
};
