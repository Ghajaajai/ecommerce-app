const express = require('express'); 
const mysql = require('mysql2');
const AWS = require('aws-sdk');
const app = express();

const rds = {
  host: 'ENDPOINT_RDS',
  user: 'admin',
  password: 'admin1234',
  database: 'ecommerce'
};

const connection = mysql.createConnection(rds);

AWS.config.update({
  region: 'ap-southeast-1',  
  accessKeyId: 'AKIASIVGLLP7BBP545JU', 
  secretAccessKey: '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'  
});

const s3 = new AWS.S3();

async function fetchPosts() {
  const bucketName = 'blog-bucket-uts'; 
  const params = {
    Bucket: bucketName,
    MaxKeys: 100 
  };
  
  try {
    const data = await s3.listObjectsV2(params).promise();
    return data.Contents.map(item => item.Key);  
  } catch (error) {
    console.error("Error fetching S3 objects:", error);
    return [];
  }
}

app.use(express.static(__dirname));

app.get('/produk', async (req, res) => {
  try {
    const images = await fetchPosts();  

    connection.query("SELECT * FROM produk", (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error querying database' });
      }

      
      const data = rows.map((item, index) => ({
        ...item,
        image: `https://s3-ap-southeast-1.amazonaws.com/blog-bucket-uts/${images[index]}`
      }));

      res.json(data);
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

app.listen(80, () => console.log("Web berjalan di port 80"));
