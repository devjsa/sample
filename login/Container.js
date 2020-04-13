import React, { Fragment, PureComponent } from 'react';
import { detect } from 'detect-browser';
import { Button } from 'reactstrap';
import { toastr } from 'react-redux-toastr';
import { GoogleLogout } from 'react-google-login';
import isMobile from '../../util/helpers/isMobile';
import replaceKoreaPhoneNumber from '../../util/helpers/replaceKRPhone';
import LoginForm from './Presenter';
import logoImage from '../../images/image-logo-login.svg';
import constatns from '../../constants';
import Common, { translate as _t } from '../../common';
import * as actions from '../../actions';
import OnlyChromeBrowserDialog from './OnlyChromeBrowserDialog';
import './style.css';

const appDownloadLink = 'http://onelink.to/albam';
const appDeepLink = 'albamowner://open';

class LoginContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      account: '',
      password: '',
      canRender: false,
    };

    this.browser = detect();
    this.isMobileDevice = isMobile();
    this.tempIndex = 0;

    this.canRender = false;
    /**
     * - 일반인을 위한 구글 로그인 -> this.isSignupByGoogle = false
     * - 세무사 초대링크를 타고온 사람에게 열어주는 구글 계정으로 회원가입 -> this.isSignupByGoogle = true
     */
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps) {
    if (this.props.token) {
      this.afterLoginAction();
    }
    // 실패 한 경우 구글 로그아웃 처리
    if (prevProps.loginStatus === actions.REQUEST && this.props.loginStatus === actions.FAILURE) {
      if (this.googleLogoutButton) {
        this.googleLogoutButton.signOut();
      }
    }
  }

  /**
   * account 형식이 전화번호인지 체크합니다.
   * 1. account를 자릿수 0부터 3까지 자른 다음 그 결과가 '010' 이면서
   * 2. account에 이메일 형식인 '@' 가 포함되어있지 않을 경우
   * => account는 전화번호 형식
   * @returns {boolean}
   */
  get isPhoneAccount() {
    const { account } = this.state;

    if (!account) return false;

    return !account.includes('@');
  }

  handleLogin = () => {
    let { account, password } = this.state;
    if (!account || !password) {
      toastr.warning(Common.APP_NAME, _t('pleaseInputIdOrPassword'));
      return;
    }

    if (this.isPhoneAccount) account = replaceKoreaPhoneNumber(account);

    this.props.loginRequest({
      account,
      password,
      successAction: this.afterLoginAction,
    });
  };

  onPressForceProgress = () => {
    console.log('세무사 강제 업데이트');
    this.props.setShowPropptModal(false);
    this.props.requestPromoteToTaxAccountant(true);
  };

  onPressNotForceProgress = () => {
    console.log('세무사 강제 업데이트 중지');
    this.props.setShowPropptModal(false);
    this.props.routeTo('/invalid-response/');
  };

  afterLoginAction = () => {
    // 로그인 이후 동작.

    // 기존 계정이 있으면서 세무사 초대링크로 온 경우
    const afterSuccessLogin = () => {
      this.props.getStoresWithStaffs({ isFetchNoti: true });
      this.props.history.push('/');
    };
    const fail = () => {
      console.log('fail - 기존 계정이 있으면서 세무사 초대링크로 온 경우 세무사로 업그레이드');
      this.props.routeTo('/');
    };
    if (this.props.inviteCode) {
      this.props.requestPromoteToTaxAccountant({ success: afterSuccessLogin, fail });
    } else {
      afterSuccessLogin();
    }
  };

  googleLoginSuccessCallback = res => {
    const tokenId = res.tokenId || (res.tokenObj && res.tokenObj.id_token);
    if (res) {
      this.props.setGoogleOAuthInfo(res);
    }
    if (tokenId) {
      const { email } = res.profileObj;
      const invite_code = this.props.inviteCode;
      const routingURLToSignUpWithInviteCode = `/user-signup/${invite_code}`;
      this.props.loginRequest({
        account: email,
        password: '',
        google_id_token: tokenId,
        isSignupByGoogle: false,
        inviteCode: invite_code,
        routingURLToSignUpWithInviteCode,
      });
    }
  };

  googleLoginErrorCallback = res => {
    console.log('[ERROR] 구글 로그인 관련 오류', res);
    if (res.error) {
      //오류가 있는 경우 화면에 표시함.
      if (res.details) {
        toastr.warning('Google Authorization Error', _t('googleLoginError') + res.details);
      } else if (res.error !== 'popup_closed_by_user') {
        // 사용자가 닫은 경우가 아니면 오류 표시
        toastr.warning('Google Authorization Error', _t('googleLoginError') + res.error);
      }
    }
  };

  googleLogoutSuccessCallback = response => {
    try {
      const oAuth = window.gapi.auth2.getAuthInstance();
      oAuth.disconnect();

      // const googleLogoutUrl = `https://accounts.google.com/Logout`;
      // window.location.href = googleLogoutUrl;
    } catch (e) {
      console.error(e);
    }
    console.log('[INFO] 로그인에 실패해서 구글에서 로그인 요청했던 토큰을 초기화했습니다.');
  };

  appleLoginCallback = res => {
    const {error, user, authorization} = res;
    console.log(error, user, authorization);

    if (error) {
      toastr.warning('Apple Authorization Error', _t('appleLoginError') + error);

    }else{
      this.props.loginRequest({
        account: user.email,
        password: '',
        apple_id_token: authorization.id_token,
        isSignupByGoogle: false,
        inviteCode: ''
      });
    }  
  };

  callDeepLink = () => {
    if (this.browser.os === 'Android OS') {
      const iframe = document.createElement('iframe');
      iframe.style.border = 'none';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.src = appDeepLink;
      document.body.appendChild(iframe);
    }
    const text = _t('noSupportMobile')
      .split('{0}')
      .map(row => {
        this.tempIndex += 1;
        return (
          <span style={{ fontSize: 25 }} key={`login_m_${this.tempIndex}`}>
            {row}
            <br />
          </span>
        );
      });
    setTimeout(() => {
      this.appLink.click();
      this.appDownloadLink.click();
    }, 1000);
    return (
      <div>
        {text}
        <br />
        <div style={{ marginTop: 25 }}>
          <a
            ref={c => {
              this.appLink = c;
            }}
            href={appDeepLink}
          >
            <Button onClick={() => {}} color="primary" size="large" style={{ fontSize: 24 }}>
              {_t('goToApp')}
            </Button>
          </a>
        </div>
        <div style={{ marginTop: 25 }}>
          <a
            ref={c => {
              this.appDownloadLink = c;
            }}
            href={appDownloadLink}
          >
            <Button onClick={() => {}} color="primary" size="large" style={{ fontSize: 24 }}>
              {_t('goToAppStore')}
            </Button>
          </a>
        </div>
      </div>
    );
  };

  renderBrowserInfo() {
    const { isHidePopup } = this.state;
    const chromeUrl = 'https://www.google.com/chrome/index.html';
    switch (this.browser && this.browser.name) {
      case 'chrome':
        // 크롬으로 정식 서비스
        return null;
      default:
        return (
          <OnlyChromeBrowserDialog
            hidePopup={isHidePopup}
            chromeUrl={chromeUrl}
            onClick={() => {
              this.setState({ isHidePopup: true });
            }}
          />
        );
    }
  }

  onChangeAccount = account => {
    this.setState({ account: account.target.value });
  };

  onChangePassword = password => {
    this.setState({ password: password.target.value });
  };

  onKeyDown = e => {
    if (e.keyCode === 13) {
      this.handleLogin();
    }
  };

  init = async () => {
    const token = Common.getToken();
    this.setState({
      canRender: !(token && token.token),
    });

    /**
     * 1>세무사 초대링크 계정이 있는 경우로 온경우
     *  1.1> 구글 회원가입 버튼/ -> this.isSignupByGoogle = false, this.state.canRender = true
     * 2>세무사 초대링크로 NOT 온경우
     *  2.1> 토큰이 있는경우 '/'로 보낸다.
     *  2.2> 토큰이 없는경우 -> login으로 보냄
     */

    const invite_code = this.props.inviteCode;
    try {
      if (invite_code) {
        const successAction = () => {
          this.setState({
            canRender: true,
          });
        };
        const failAction = () => {
          this.props.requestValdidationModalToggle(true);
          this.setState({
            canRender: true,
          });
        };
        this.validInviteCode(invite_code, successAction, failAction);
      } else {
        // 이미 로그인 된 상황, 토큰을 가지고 있는 상황.
        const { token } = this.props;
        if (token) {
          this.props.history.push('/');
        } else {
          this.props.history.push('/login');
        }
      }
    } catch (e) {
      console.log('errored in isValidInviteCode', e.message);
    }
    // document.body.classList.toggle('sidebar-hidden');
  };

  /**
   *
   * @param invite_code
   * return boolean
   */
  validInviteCode = (invite_code, successAction, failAction) => {
    if (invite_code === undefined) return false;

    this.props.requestInviteCodeValidation({ invite_code, successAction, failAction });
  };

  onPressConfirm = () => {
    console.log('모달 애러 처리');
    this.closeModal();
  };

  closeModal = () => {
    this.props.requestValdidationModalToggle(false);
    this.props.routeTo('/invalid-response/');
  };

  render() {
    return this.state.canRender ? (
      <section className="LoginContainer">
        <section className="LoginCenterAlign">
          {!this.isMobileDevice && this.renderBrowserInfo()}
          {this.isMobileDevice ? (
            this.callDeepLink()
          ) : (
            <Fragment>
              <img src={logoImage} alt="Albam Login Logo" className="ImageLogoLogin" />
              <span className="Bold-Title-Type1 LoginWelcomeMessage">{_t('welcomeApp')}</span>
              <LoginForm
                account={this.state.account}
                password={this.state.password}
                isShowModal={this.props.isShowModal}
                isShowPromptModal={this.props.isShowPromptModal}
                titleText={this.props.taxAccountant.return_message}
                returnCode={this.props.taxAccountant.return_code}
                joinResponse={this.props.joinResponse}
                bodyText={this.props.bodyText}
                className="LoginForm"
                handleLogin={this.handleLogin}
                googleLoginSuccessCallback={this.googleLoginSuccessCallback}
                googleLoginErrorCallback={this.googleLoginErrorCallback}
                appleLoginCallback={this.appleLoginCallback}
                onPressConfirm={this.onPressConfirm}
                onChangeAccount={this.onChangeAccount}
                onChangePassword={this.onChangePassword}
                onKeyDown={this.onKeyDown}
                isGoogleSignUp={this.isSignupByGoogle}
                onPressForceProgress={this.onPressForceProgress}
                onPressNotForceProgress={this.onPressNotForceProgress}
              />
              <GoogleLogout
                ref={c => {
                  this.googleLogoutButton = c;
                }}
                style={{ display: 'none' }}
                buttonText=""
                responseType="id_token code"
                onLogoutSuccess={this.googleLogoutSuccessCallback}
              />
            </Fragment>
          )}
        </section>
      </section>
    ) : (
      <div className="MainSpinnerWrapper">
        <div className="MainSpinner">
          <div className="dot1" />
          <div className="dot2" />
        </div>
      </div>
    );
  }
}

export default LoginContainer;
