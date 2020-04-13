import React from 'react';
import BigInput from '../../components/input/BigInput';
import BigButton from '../../components/button/BigButton';
import JoinField from './UserJoinField';
import GoogleLoginButton from '../../components/button/GoogleLoginButton';
import AppleLoginButton from '../../components/button/AppleLoginButton';
import ModalwithCloseButton from '../../components/modal/withCloseButton';
import icWarning from '../../images/ic-warning.png';
import { _t } from '../../common';
import ModalWithPromptButton from '../../components/modal/withPromptButton';
import { getModalBodyText } from '../../util/inviteCodeValidtaionModal';

const LoginForm = ({
  account,
  password,
  className,
  //  이벤트 리스너
  onChangeAccount,
  onChangePassword,
  handleLogin,
  googleLoginErrorCallback,
  googleLoginSuccessCallback,
  appleLoginCallback,
  onKeyDown,
  isShowModal,
  onPressConfirm,
  isGoogleSignUp,
  isShowPromptModal,
  onPressNotForceProgress,
  onPressForceProgress,
  titleText,
  returnCode,
  bodyText,
  joinResponse,
}) => {
  return (
    <section className={className}>
      <div className="login__input-group">
        <BigInput
          useInteraction
          placeholder={_t('accountPlaceholder')}
          value={account}
          onChange={onChangeAccount}
          onKeyDown={onKeyDown}
          name="account"
          label={_t('account')}
        />
        <div className="LoginPasswordInputContainer">
          <BigInput
            useInteraction
            type="password"
            value={password}
            label={_t('password')}
            placeholder={_t('password')}
            onChange={onChangePassword}
            onKeyDown={onKeyDown}
            name="userPassword"
          />
        </div>
      </div>
      <ModalwithCloseButton
        className="with-close-button"
        isShowModal={isShowModal}
        imgSrc={icWarning}
        titleText={titleText || ''}
        bodyText={getModalBodyText(bodyText, returnCode)}
        buttonText={_t('confirm')}
        closeModal={onPressConfirm}
      />
      <ModalWithPromptButton
        className="with-promptButton"
        isShowModal={isShowPromptModal}
        imgSrc={icWarning}
        titleText={joinResponse.return_message}
        bodyText={getModalBodyText(undefined, joinResponse.return_code)}
        buttonText={_t('confirm')}
        closeModal={onPressNotForceProgress}
        confirmModal={onPressForceProgress}
      />
      <section className="LoginButtonSection LoginDefaultAlign">
        <BigButton onClick={handleLogin} color="primary" className="LoginButton" buttonText={_t('login')} />
        <section className="LoginOrSection LoginDefaultAlign">
          <div className="LoginOrLine" />
          <span className="LoginOrText">{_t('or')}</span>
          <div className="LoginOrLine" />
        </section>
        <AppleLoginButton
          appleLoginCallback={appleLoginCallback}
        />
        <GoogleLoginButton
          googleLoginErrorCallback={googleLoginErrorCallback}
          googleLoginSuccessCallback={googleLoginSuccessCallback}
          isSignUp={isGoogleSignUp}
        />
      </section>
      <section className="LoginHelpSection">
        <p>{_t('accessAuthorityMessage')}</p>
        {/*<p>비밀번호를 잊으셨나요? 비밀번호 찾기</p>*/}
      </section>
      {/*
      <section className="JoinSection">
        <JoinField />
      </section>
      */}
    </section>
  );
};

export default LoginForm;
