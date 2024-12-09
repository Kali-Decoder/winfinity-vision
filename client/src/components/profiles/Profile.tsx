import { Capacitor } from '@capacitor/core';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAccount } from 'wagmi';

import Menu from '@/components/menu/Menu';
import NextImage from '@/components/NextImage';

const Profile = () => {
  const { address } = useAccount(); // Get the wallet address
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load previously uploaded videos for this wallet from localStorage
    const storedVideos = JSON.parse(
      localStorage.getItem('uploadedVideos') || '{}'
    );
    if (address && storedVideos[address]) {
      setUploadedVideos(storedVideos[address]);
    }
  }, [address]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setVideoFile(file);
  };

  const uploadToPinata = async () => {
    if (!videoFile || !address)
      return alert('Please select a file and connect your wallet.');

    const apiKey = '6adf22f6dd83ab814774';
    const apiSecret =
      '775e45eaadd7fb32554eabf4dd0e7090c70f79dbec51e99cc6fe121f26f270de';

    const formData = new FormData();
    formData.append('file', videoFile);

    try {
      setLoading(true);
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: apiKey,
            pinata_secret_api_key: apiSecret,
          },
        }
      );

      const fileHash = response.data.IpfsHash;
      const videoURL = `https://gateway.pinata.cloud/ipfs/${fileHash}`;

      // Save video URL and wallet address association in localStorage
      const storedVideos = JSON.parse(
        localStorage.getItem('uploadedVideos') || '{}'
      );
      if (!storedVideos[address]) storedVideos[address] = [];
      storedVideos[address].push(videoURL);
      localStorage.setItem('uploadedVideos', JSON.stringify(storedVideos));

      setUploadedVideos((prev) => [...prev, videoURL]);
      alert('File uploaded successfully!');
      setLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        alert('Error uploading file: ' + error.message);
      } else {
        alert('Error uploading file');
      }
      alert('Failed to upload the file to Pinata.');
      setLoading(false);
    }
  };

  return (
    <div
      className='flex min-h-screen flex-col overflow-hidden text-white'
      style={{ backgroundColor: 'transparent' }}
    >
      <div className='flex flex-grow flex-col items-center gap-3 overflow-y-auto px-4'>
        <NextImage
          src='/images/demo-profile.png'
          alt='Image placeholder'
          className='relative h-32 w-32 rounded-full border-4 border-primary-500'
          imgClassName='object-cover rounded-full'
          fill
        />
        <span className='mt-4 block text-3xl'>
          {address ? address : 'Nikku.Dev'}
        </span>
      </div>

      {createPortal(<Menu />, document.body)}
    </div>
  );
};

export default Profile;
