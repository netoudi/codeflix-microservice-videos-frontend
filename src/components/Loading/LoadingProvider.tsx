import React, { useMemo, useState } from 'react';
import LoadingContext from './LoadingContext';
import {
  addGlobalRequestInterceptor,
  addGlobalResponseInterceptor,
  removeGlobalRequestInterceptor,
  removeGlobalResponseInterceptor,
} from '../../util/http';

const LoadingProvider: React.FC = (props) => {
  const [loading, setLoading] = useState<boolean>(false);

  useMemo(() => {
    console.log('LoadingProvider');

    let isSubscribed = true;

    const requestIds = addGlobalRequestInterceptor((config) => {
      if (isSubscribed) {
        setLoading(true);
      }

      return config;
    });

    const responseIds = addGlobalResponseInterceptor(
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
      removeGlobalRequestInterceptor(requestIds);
      removeGlobalResponseInterceptor(responseIds);
    };
  }, [true]);

  return <LoadingContext.Provider value={loading}>{props.children}</LoadingContext.Provider>;
};

export default LoadingProvider;
