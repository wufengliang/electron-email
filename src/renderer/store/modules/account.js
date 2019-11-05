const state = {
  accountData: [],
  filePath: null,
};

const mutations = {
  ADD_ACCOUNT_DATA: (state, data) => {
    state.accountData = data;
  },
  DELETE_ACCOUNT_DATA: (state, single) => {
    const index = state.accountData.findIndex(item => item.account === single);
    state.accountData.splice(index, 1);
  },
  ADD_FILE_PATH: (state, filePath) => {
    state.filePath = filePath;
  },
};

const actions = {
  addAccountData({ commit }, data) {
    commit('ADD_ACCOUNT_DATA', data);
  },
  deleteAccountData({ commit }, data) {
    commit('DELETE_ACCOUNT_DATA', data);
  },
  addFilePath({ commit }, data) {
    commit('ADD_FILE_PATH', data);
  },
};

export default {
  state,
  mutations,
  actions,
};
