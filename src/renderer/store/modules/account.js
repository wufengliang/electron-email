const state = {
  sendAccount: null, //  发送账号,
  revicers: [], //  接收账号
  sendStatus: '',  //  发送状态
};

const mutations = {
  SET_SEND_ACOUNT: (state, account) => {
    state.sendAccount = account;
  },
  SET_REVICERS_COUNT: (state, revicers) => {
    state.revicers = revicers;
  },
  SET_SEND_STATUS: (state, status) => {
    state.sendStatus = status;
  }
};

const actions = {

};

export default {
  state,
  mutations,
  actions,
  namespaced: true,
};
