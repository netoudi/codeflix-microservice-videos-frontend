import React, { useEffect, useMemo, useState } from 'react';
import LoadingContext from './LoadingContext';
import {
  addGlobalRequestInterceptor,
  addGlobalResponseInterceptor,
  removeGlobalRequestInterceptor,
  removeGlobalResponseInterceptor,
} from '../../util/http';

function hasOwnProperty(obj: object, property: string) {
  return obj !== undefined && Object.prototype.hasOwnProperty.call(obj, property);
}

const LoadingProvider: React.FC = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [countRequest, setCountRequest] = useState(0);

  useMemo(() => {
    let isSubscribed = true;

    // axios.interceptors.request.use();
    const requestIds = addGlobalRequestInterceptor((config) => {
      if (isSubscribed && !hasOwnProperty(config?.headers, 'X-Ignore-Loading')) {
        setLoading(true);
        incrementCountRequest();
      }

      return config;
    });

    // axios.interceptors.response.use();
    const responseIds = addGlobalResponseInterceptor(
      (response) => {
        if (isSubscribed && !hasOwnProperty(response.config?.headers, 'X-Ignore-Loading')) {
          decrementCountRequest();
        }

        return response;
      },
      (error) => {
        if (isSubscribed && !hasOwnProperty(error.config?.headers, 'X-Ignore-Loading')) {
          decrementCountRequest();
        }

        return Promise.reject(error);
      },
    );

    return () => {
      isSubscribed = false;
      removeGlobalRequestInterceptor(requestIds);
      removeGlobalResponseInterceptor(responseIds);
    };
  }, []);

  useEffect(() => {
    if (!countRequest) {
      setLoading(false);
    }
  }, [countRequest]);

  function incrementCountRequest() {
    setCountRequest((prevCountRequest) => prevCountRequest + 1);
  }

  function decrementCountRequest() {
    setCountRequest((prevCountRequest) => prevCountRequest - 1);
  }

  return <LoadingContext.Provider value={loading}>{props.children}</LoadingContext.Provider>;
};

export default LoadingProvider;
