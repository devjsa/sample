import React, {useEffect} from 'react';
import AppleLogin from 'react-apple-login';
import './style.css';
import { translate as _t } from '../../../common';
import Constants from '../../../constants';

const getButtonText = _t('loginWithApple');

const AppleLoginButton = ({appleLoginCallback}) => {
  return (
    <AppleLogin
      clientId={Constants.APPLE.APPLE_WEB_CLIENT_ID}
      redirectURI={Constants.APPLE.APPLE_WEB_REDIRECT_URL}   
      responseType="code"
      responseMode="query"
      callback={appleLoginCallback}
      designProp={
        {
           height: 30,
           width: 140,
           color: "black",
           border: false,
           type: "sign-in",
           border_radius: 15,
           scale: 1,
           locale: "en_US", 
         }
       }
    />
  );
};



export default AppleLoginButton;
