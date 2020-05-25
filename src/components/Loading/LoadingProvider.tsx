import React, { useEffect, useMemo, useState } from 'react';
import { omit } from 'lodash';
import LoadingContext from './LoadingContext';
import {
  addGlobalRequestInterceptor,
  addGlobalResponseInterceptor,
  removeGlobalRequestInterceptor,
  removeGlobalResponseInterceptor,
} from '../../util/http';

const LoadingProvider: React.FC = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [countRequest, setCountRequest] = useState(0);

  useMemo(() => {
    let isSubscribed = true;

    const requestIds = addGlobalRequestInterceptor((config) => {
      if (isSubscribed && !Object.prototype.hasOwnProperty.call(config, 'ignoreLoading')) {
        setLoading(true);
        incrementCountRequest();
      }

      return {
        ...config,
        headers: omit(config.headers, 'ignoreLoading'),
      };
    });

    const responseIds = addGlobalResponseInterceptor(
      (response) => {
        if (isSubscribed) {
          decrementCountRequest();
        }

        return response;
      },
      (error) => {
        if (isSubscribed) {
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
