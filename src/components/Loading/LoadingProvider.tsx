import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingContext from './LoadingContext';

const LoadingProvider: React.FC = (props) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('LoadingProvider');

    let isSubscribed = true;

    axios.interceptors.request.use((config) => {
      if (isSubscribed) {
        setLoading(true);
      }

      return config;
    });

    axios.interceptors.response.use(
      (response) => {
        if (isSubscribed) {
          setLoading(false);
        }

        return response;
      },
      (error) => {
        if (isSubscribed) {
          setLoading(false);
        }

        return Promise.reject(error);
      },
    );

    return () => {
      isSubscribed = false;
    };
  }, []);

  return <LoadingContext.Provider value={loading}>{props.children}</LoadingContext.Provider>;
};

export default LoadingProvider;
