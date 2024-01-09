import STATUS_CODE from "../constants/statusCodes.js";
import User from "../models/userModel.js";

// // @des     Create a new user
// // @route   POST api/v1/banking/users
// // @access  Public
export const createUser = async (req, res, next) => {
  try {
    const body = req.body;
    const user = await User.create(body);
    res.status(STATUS_CODE.CREATED).send(user);
    res.send("Create");
  } catch (error) {
    next(error);
  }
};

// // @des     Delete User
// // @route   DELETE api/v1/banking/users/:id
// // @access  Public
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteUser = await User.findOneAndDelete(id);
    if (!deleteUser) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("Delete Failed");
    }
    console.log(deleteUser);
    res.status(STATUS_CODE.OK).send("User have Been deleted");
  } catch (error) {
    next(error);
  }
};

// // @des     Deposit money
// // @route   PATCH api/v1/banking/users/:id/deposit
// // @access  Public
export const depositMoney = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cash } = req.body;
    // get user from DataBase
    const user = await User.findById(id);
    // check if user available
    if (!user) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error(`User with this id:${id} is not found`);
    }
    if (!user.isActive) {
      res.status(STATUS_CODE.FORBIDDEN);
      throw new Error("Failed to deposite_ User is not Active");
    }
    await User.findByIdAndUpdate(
      id,
      { $set: { cash: user.cash + cash } },
      { new: true }
    );

    res.status(STATUS_CODE.OK).send(`Amount of ${cash} have been deposited`);
  } catch (error) {
    next(error);
  }
};

// all users with X amount of cash
// @route   GET api/v1/banking/users/filter/cash/:amount
// @access  Public
export const filterByAmountOfCash = async (req, res, next) => {
  try {
    const { amount } = req.params;
    // get filter types from body
    const { isGreaterThan, andEqual } = req.body;
    if (isNaN(amount)) {
      res.status(STATUS_CODE.FORBIDDEN);
      throw new Error("failed to add amount");
    }
    let cashQuery = {};
    // // gt: isGreaterThan !andEqual
    // //gte: isGreaterThan andEqual
    // if(isGreaterThan) {
    //     cashSearchQuery = {cash: {$gte: amount }}
    // }
    // else {
    //     cashSearchQuery = {cash: {$gt: amount}}
    // }
    // // lt:!isGreaterThan !notEqual
    // //lte: !isgreaterThan ndEqual

    if (isGreaterThan && andEqual) {
      // $gte
      cashQuery = { cash: { $gte: amount } };
    } else if (isGreaterThan && !andEqual) {
      // $gt
      cashQuery = { cash: { $gt: amount } };
    } else if (!isGreaterThan && !andEqual) {
      // $lt
      cashQuery = { cash: { $lt: amount } };
    } else if (!isGreaterThan && andEqual) {
      // $lte
      cashQuery = { cash: { $lte: amount } };
    }
    const users = await User.find(cashQuery);
    res.status(STATUS_CODE.OK).send(users);
  } catch (error) {
    next(error);
  }
};

// // @des     Get all the users
// // @route   GET api/v1/banking/users
// // @access  Public
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.send(users);
  } catch (error) {
    next(error);
  }
};

// // @des     Get a certain user
// // @route   GET api/v1/banking/users/:id
// // @access  Public
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("User not found");
    }
    res.status(STATUS_CODE.OK).send(user);
  } catch (error) {
    next(error);
  }
};

// @des     Money transaction between two users
// @route   PATCH api/v1/banking/users/:from/transact/:to
// @access  Public
export const transactMoney = async (req, res, next) => {
  try {
    // get the ids of the sender and reciever
    const { from, to } = req.params;

    // get cash amount from body
    const { cash } = req.body;

    // validate if cash amount is a number
    if (isNaN(cash) || !cash) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error("You must insert a valid cash amount to transact");
    }

    const sender = await User.findById(from);

    const reciever = await User.findById(to);

    if (!sender || !reciever) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("One or more users not found");
    }

    if (!sender.isActive || !reciever.isActive) {
      res.status(STATUS_CODE.FORBIDDEN);
      throw new Error("Transaction failed - both users must be active");
    }

    const maxAllowedToSend = sender.cash + sender.credit;

    if (cash > maxAllowedToSend) {
      res.status(STATUS_CODE.BAD_REQUEST);
      throw new Error(
        "Transaction Failed - sender does not have enough cash and credit"
      );
    }

    let deductedCash = 0;
    let deductedCredit = 0;

    if (cash <= sender.cash) {
      deductedCash = cash;
      deductedCredit = 0;
    } else {
      deductedCash = sender.cash;
      deductedCredit = cash - sender.cash;
    }

    // update - take cash and credit from sender
    await User.findByIdAndUpdate(
      from,
      {
        $set: {
          cash: sender.cash - deductedCash,
          credit: sender.credit - deductedCredit,
        },
      },
      { new: true }
    );

    // update - give cash to reciever
    await User.findByIdAndUpdate(
      to,
      { $set: { cash: reciever.cash + cash } },
      { new: true }
    );

    res.send(
      `successfully send ${cash} from ${sender.firstName} to ${reciever.firstName}`
    );
  } catch (error) {
    next(error);
  }
};

// // @des     Update user credit
// // @route   PATCH api/v1/banking/users/:id/credit
// // @access  Public
export const updateUserCredit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { credit } = req.body;
    // get user from DataBase
    const user = await User.findById(id);
    // check if user available
    if (!user) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error(`User with this id:${id} is not found`);
    }
    if (!user.isActive) {
      res.status(STATUS_CODE.FORBIDDEN);
      throw new Error("Failed to update credit_ User is not Active");
    }
    await User.findByIdAndUpdate(
      id,
      { $set: { credit: user.credit + credit } },
      { new: true }
    );

    res
      .status(STATUS_CODE.OK)
      .send(`Amount of $${credit} successfully deposited`);
  } catch (error) {
    next(error);
  }
};

// // @des     Update user Status
// // @route   PATCH api/v1/banking/users/:id/active
// // @access  Public
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    //get new isAvctive value from request body
    const { isActive } = req.body;
    const user = await User.findById(id);

    // check if user does not exist
    if (!user) {
      res.status(STATUS_CODE.NOT_FOUND);
      throw new Error("User not found");
    }

    // check if the isActive state of the user is equal to the isActive value sent in the request body
    if (user.isActive === isActive) {
      res.send(`User's isActive vlaue is already ${isActive}`);
    }

    //update active value
    await User.findByIdAndUpdate(
      id,
      { $set: { isActive: isActive } },
      { new: true }
    );

    res.status(STATUS_CODE.OK).send(`Updated isActive value to ${isActive}`);
  } catch (error) {
    next(error);
  }
};
