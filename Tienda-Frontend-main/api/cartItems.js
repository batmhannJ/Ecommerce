const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config(); // Load environment variables

const uri = 'mongodb+srv://dbUser:dbUserPassword@cluster0.fypkkcn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
let client;

async function connectToDB() {
  if (!client) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
  }
  return client.db('test'); // Use the actual database name
}

// Handler to get cart items for a user
export const cartItemsHandler = async (req, res) => {
  const userId = req.params.userId; // Get userId from route parameters

  if (req.method === 'GET') {
    try {
      const db = await connectToDB();
      const cart = await db.collection('carts').findOne({ userId });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found for this user' });
      }

      console.log("Cart items fetched:", cart.cartItems);
      res.status(200).json({ cartItems: cart.cartItems || [] });
    } catch (error) {
      console.error("Error fetching cart items:", error);
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  } else if (req.method === 'POST') {
    const { cartItems } = req.body; // Assume cartItems is sent in the request body

    if (!cartItems) {
      return res.status(400).json({ error: "Cart items are required" });
    }

    try {
      const db = await connectToDB();
      const updateResult = await db.collection('carts').updateOne(
        { userId },
        { $set: { cartItems } }, // Update the cartItems for the user
        { upsert: true } // Create a new document if one doesn't exist
      );

      console.log("Cart items updated successfully:", updateResult);
      res.status(200).json({ message: "Cart updated successfully" });
    } catch (error) {
      console.error("Error updating cart items:", error);
      res.status(500).json({ error: "Failed to update cart items" });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
