import { connect } from 'react-redux';
import Container from './Container';
import * as actions from '../../actions';

const mapStateToProps = (state, ownProps) => {
  const inviteCode = state.taxAccountant.validResponse && state.taxAccountant.validResponse.invite_code;
  return {
    inviteCode,
    matchParams: ownProps.match.params,
    token: state.authentication.token,
    loginStatus: state.httpStatus.loginStatus,
    loginFailReason: state.httpStatus.loginFailReason,
    taxAccountant: state.taxAccountant.validResponse,
    joinResponse: state.taxAccountant.joinResponse,
    isSignupByGoogle: state.authentication.isSignupByGoogle,
    isShowPromptModal: state.ui.isShowPromptModal,
    isShowModal: state.ui.isValdidationModalToggleShow,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loginRequest: param => {
      dispatch(actions.login.request(param));
    },
    getProfile: param => {
      dispatch(actions.getProfile.request(param));
    },
    getStoresWithStaffs: param => {
      dispatch(actions.getStoresWithStaffs.request(param));
    },
    requestInviteCodeValidation: param => {
      dispatch(actions.inviteCodeValidation.request(param));
    },
    routeTo: url => {
      dispatch(actions.routeTo.request(url));
    },
    setGoogleOAuthInfo: param => {
      dispatch(actions.setGoogleOAuthInfo(param));
    },
    requestPromoteToTaxAccountant: isForce => {
      dispatch(actions.promoteToTaxAccountant.request(isForce));
    },
    setShowPropptModal: isShowModal => {
      dispatch(actions.setShowPropptModal(isShowModal));
    },
    requestValdidationModalToggle: isShow => {
      dispatch(actions.validationModalToggle.request(isShow));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Container);
