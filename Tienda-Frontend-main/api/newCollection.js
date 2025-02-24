const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config(); // Load environment variables

// MongoDB URI and base URL for images
const uri = 'mongodb+srv://dbUser:dbUserPassword@cluster0.fypkkcn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
let client;

// Function to connect to MongoDB
async function connectToDB() {
  if (!client) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
  }
  return client.db('test'); 
}

export const newCollectionsHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const db = await connectToDB();
    const products = await db.collection('products').find({}).toArray(); // Retrieve all products

    const newCollection = products.slice(1).slice(-8); // Get the last 8 products, excluding the first

    const updatedProducts = newCollection.map(product => {
      const mainImage = product.image ? `https://tienda-han.onrender.com/images/${product.image}` : null; // Use backticks
      const editedImage = product.editedImage ? `https://tienda-han.onrender.com/images/${product.editedImage}` : null; // Use backticks
      const imageToDisplay = editedImage || mainImage;

      return {
        ...product,
        image: imageToDisplay
      };
    });

    console.log("New Collection Fetched");
    res.status(200).json(updatedProducts);
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};