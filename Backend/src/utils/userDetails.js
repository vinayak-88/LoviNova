const userDetails = (user) => {
  const userObj = user.toObject();
  const fieldsToRemove = ["password", "createdAt", "updatedAt", "__v", "emailId", "lastActive"];

  fieldsToRemove.forEach((field) => delete userObj[field]);
  return userObj;
};

module.exports = userDetails;
