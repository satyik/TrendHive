const Product = require('../src/models/product.model');
const User = require('../src/models/User');

exports.getBag = async (req, res) => {
  try {
    const user = req.user;
    const bag = user.bagItems;

    if (bag.length === 0) {
      return res.json({ empty: true, items: [] });
    }

    const prodArr = [];
    let total = 0, quantity = 0, actualPrice = 0;

    for (let item of bag) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      prodArr.push({ product, quantity: item.quantity });

      const itemTotal = product.price * item.quantity;
      actualPrice += itemTotal;
      total += itemTotal; // Assuming no discounts
      quantity += item.quantity;
    }

    const discount = actualPrice - total;

    return res.json({ items: prodArr, total, quantity, discount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToBag = async (req, res) => {
  const prodId = req.params.id;
  const userId = req.user._id;
  const user = req.user;
  const bag = [...user.bagItems];

  const index = bag.findIndex(item => item.productId === prodId);
  if (index !== -1) {
    bag[index].quantity++;
  } else {
    bag.push({ productId: prodId, quantity: 1 });
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { bagItems: bag },
    { new: true }
  ).lean();

  res.json(updatedUser.bagItems);
};

exports.deleteItem = async (req, res) => {
  const { userId, prodId } = req.body;
  const user = await User.findById(userId);
  const newBag = user.bagItems.filter(item => item.productId !== prodId);

  await User.findByIdAndUpdate(userId, { bagItems: newBag });
  res.json({ success: true });
};

exports.clearBag = async (req, res) => {
  const { userId } = req.body;
  await User.findByIdAndUpdate(userId, { bagItems: [] });
  res.json({ success: true });
};
