import React, { useState, useEffect } from 'react';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const S3BucketViewer = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedVideos, setSelectedVideos] = useState([]);
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

  const handleAddVideo = () => {
    if (selectedVideo === null) {
      return;
    } else if (selectedVideos.includes(selectedVideo)) {
      return;
    }

    setSelectedVideos([
      ...selectedVideos,
      selectedVideo
    ]);
  };

  if (loading) return <div>Loading bucket contents...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        {selectedVideos.map((video) => (
          <div className="badge badge-accent">{video}</div>
        ))}
      </div>
      <div className="flex flex-row">
        <select 
          className="select select-bordered w-full max-w-xs"
          onChange={(e) => setSelectedVideo(e.target.value)}
        >
          <option disabled selected>Select videos to include in analysis.</option>
          {files.map((file) => (
            <option key={file.name}>{file.name}</option>
          ))}
        </select>
        <button className="btn btn-neutral" onClick={handleAddVideo}>Add Video</button>
      </div>
    </div>
  );
};

export default S3BucketViewer;