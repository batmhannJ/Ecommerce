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

const popularInCraftsHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const db = await connectToDB();
    const products = await db.collection('products').find({ category: 'crafts' }).toArray();

    const popularInCrafts = products.slice(5, 9); // Get products from index 5 to 8

    const updatedProducts = popularInCrafts.map(product => {
      const mainImage = product.image ? `https://tienda-han.onrender.com/images/${product.image}` : null;
      const editedImage = product.editedImage ? `https://tienda-han.onrender.com/images/${product.editedImage}` : null;
      const imageToDisplay = editedImage || mainImage;

      return {
        ...product,
        image: imageToDisplay
      };
    });

    console.log("Popular in Crafts Fetched");
    res.status(200).json(updatedProducts);
  } catch (error) {
    console.error("Error fetching popular products in crafts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { popularInCraftsHandler };