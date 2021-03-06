const users = [];

const addUser = async (userId, socketId) => {
  try {
    const user = users.find((user) => user.userId === userId);
    if (user && user.socketId === socketId) {
      return users;
    } else {
      if (user && user.socketId !== socketId) {
        await removeUser(user.socketId);
      }
      const newUser = { userId, socketId };
      users.push(newUser);
      return users;
    }
  } catch (error) {
    console.error(error);
  }
};

const removeUser = async (socketId) => {
  const index = users.map((user) => user.socketId).indexOf(socketId);

  await users.splice(index, 1);

  return;
};

const findConnectedUser = (userId) =>
  users.find((user) => user.userId === userId);

module.exports = { addUser, removeUser, findConnectedUser };
