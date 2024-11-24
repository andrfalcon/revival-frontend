import React, { useState, useEffect } from 'react';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const S3BucketViewer = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure your S3 client
  const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
    }
  });

  useEffect(() => {
    const fetchBucketContents = async () => {
      try {
        const command = new ListObjectsV2Command({
          Bucket: 'revival-videos',
        });

        const response = await s3Client.send(command);
        
        if (response.Contents) {
          const fileList = response.Contents.map(item => ({
            name: item.Key,
            lastModified: item.LastModified,
            size: item.Size
          }));
          setFiles(fileList);
        }
      } catch (err) {
        setError(err.message);
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBucketContents();
  }, []);

  if (loading) return <div>Loading bucket contents...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>S3 Bucket Contents</h2>
      <ul>
        {files.map((file) => (
          <li key={file.name}>
            <div>
              <strong>{file.name}</strong>
              <div>Last Modified: {new Date(file.lastModified).toLocaleString()}</div>
              <div>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default S3BucketViewer;