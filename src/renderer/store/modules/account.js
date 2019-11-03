const state = {
  accountData: [],
};

const mutations = {
  ADD_ACCOUNT_DATA: (state, data) => {
    state.accountData = data;
  },
  DELETE_ACCOUNT_DATA: (state, single) => {
    const index = state.accountData.findIndex(single);
    state.accountData.splice(index, 1);
  },
};

const actions = {
  addAccountData({ commit }) {
    commit('ADD_ACCOUNT_DATA');
  },
  deleteAccountData({ commit }) {
    commit('DELETE_ACCOUNT_DATA');
  },
};

export default {
  state,
  mutations,
  actions,
};
