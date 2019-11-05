<template>
  <main>
    <div class="padding-20">
      <Table
        border
        :columns="columns"
        :data="accountData"
      ></Table>
    </div>
  </main>
</template>

<script>
import { getData, setData } from "../utils/set-get.data";
export default {
  name: "look-email",
  data() {
    return {
      accountData: [],
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
                    const index = this.accountData.findIndex(item => item.account === account);
                    this.accountData.splice(index, 1);
                    const array = this.accountData;
                    console.log(array);
                    setData('accountData', array);
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
    this.accountData = getData('accountData') || [];
  },
};
</script>

<style>
</style>