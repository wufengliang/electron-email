<template>
  <main>
    <div class="padding-20">
      <Table border :columns="columns" :data="accountData"></Table>
    </div>
  </main>
</template>

<script>
import { getData, setData } from "../utils/set-get.data";
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
          key: "account",
          width: 150
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
                    const account = params.row.account;
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
  created() {
    this.$electron.remote.ipcRenderer.on("accountData", (event, args) => {
      console.log(args, 11);
    });
  },
  methods: {},
  computed: {
    accountData() {
      return getData("accountData");
    }
  }
};
</script>

<style>
</style>