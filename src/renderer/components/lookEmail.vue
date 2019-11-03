<template>
  <main>
    <div class="padding-20">
      <Table border :columns="columns" :data="accountData"></Table>
    </div>
  </main>
</template>

<script>
export default {
  name: "look-email",
  data() {
    return {
      columns: [
        {
          type: "selection",
          width: 50,
          align: "center"
        },
        {
          title: "账号",
          key: "account"
        },
        {
          title: "密码",
          key: "password"
        },
        {
          title: "操作",
          align: "center",
          render: (h, params) => {
            return h(
              "Button",
              {
                props: {
                  type: "primary",
                  size: "small"
                },
                on: {
                  click: () => {
                    console.log(params);
                    console.log(this.accountData);
                  }
                }
              },
              "删除"
            );
          }
        }
      ],
      data: []
    };
  },
  methods: {},
  computed: {
    accountData() {
      return this.$store.state.account.accountData;
    }
  }
};
</script>

<style>
</style>