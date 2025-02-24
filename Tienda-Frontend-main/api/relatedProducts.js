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

export const relatedProductsHandler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const category = req.query.category; // Retrieve category from query parameter
  if (!category) {
    return res.status(400).json({ error: "Category is required" });
  }

  try {
    const db = await connectToDB();
    const relatedProducts = await db.collection('products').find({ category }).toArray();

    const updatedRelatedProducts = relatedProducts.map(product => {
      const mainImage = product.image ? `https://tienda-han.onrender.com/images/${product.image}` : null; // Use backticks
      const editedImage = product.editedImage ? `https://tienda-han.onrender.com/images/${product.editedImage}` : null; // Use backticks
      const imageToDisplay = editedImage || mainImage;

      return {
        ...product,
        image: imageToDisplay
      };
    });

    console.log("Related Products Fetched");
    res.status(200).json(updatedRelatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ error: "Failed to fetch related products" });
  }
};