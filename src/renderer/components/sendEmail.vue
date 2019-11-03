<template>
  <main class="padding-20">
    <div class="btn-box">
      <Button
        type="primary"
        size="small"
        :disabled="accountData && accountData.length > 0"
        @click="loadEmail"
      >导入发送账号</Button>
      <Button
        type="primary"
        size="small"
        :disabled="accountData && accountData.length === 0"
        class="margin-left-10"
        @click="lookEmail"
      >查看发送账号</Button>
      <Button
        type="primary"
        size="small"
        class="margin-left-10"
        :disabled="data.length > 0"
        @click="openDialog"
      >导入接收账号</Button>
      <Button
        type="primary"
        size="small"
        class="margin-left-10"
        :disabled="data.length === 0"
        @click="reset"
      >清空数据</Button>
      <Button
        type="primary"
        size="small"
        class="margin-left-10"
        :disabled="data.length === 0"
        @click="startSend"
      >开始发送</Button>
      <Button type="primary" size="small" :disabled="data.length === 0" class="margin-left-10">停止发送</Button>
    </div>
    <div class="table-box margin-top-10">
      <Table border :loading="loading" :columns="columns" :data="data" ref="selection"></Table>
    </div>
    <div class="status">
      <div class="status-item">
        <b>发送账号:</b>
        <span>44823912@qq.com</span>
      </div>
      <div class="status-item">
        <b>接收账号:</b>
        <span>44823912@qq.com</span>
      </div>
      <div class="status-item no-radius">
        <b>状态:</b>
        <span>44823912@qq.com</span>
      </div>
    </div>
  </main>
</template>

<script>
import fs from "fs";
import nodemailer from "nodemailer";
import sendEmail from "../utils/send-emal";
import config from "../config";
export default {
  name: "send-email",
  data() {
    return {
      loading: false,
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
          title: "发送状态",
          key: "status"
        }
      ],
      data: [],
      filePath: null // 导入发送的文件
    };
  },
  methods: {
    //  导入发送账号
    loadEmail() {
      const params = {
        title: "导入发送邮件账号",
        callback: data => {
          const array =
            data.length &&
            data.map(item => {
              const data = item.split("-");
              return { account: data[0], password: data[1] };
            });
          console.log(array);
          this.$store.dispatch("addAccountData", array);
          console.log(this.accountData);
        }
      };
      this.openFile(params);
    },
    //  查看发送账号
    lookEmail() {
      const window = this.$electron.remote.BrowserWindow;
      const winURL =
        process.env.NODE_ENV === "development"
          ? "http://localhost:9080/#/look-email"
          : `file://${__dirname}/index.html#/look-email`;
      const winHandle = new window({
        width: 400,
        height: 200,
        useContentSize: false,
        resizable: false,
        autoHideMenuBar: true,
        maximizable: false
      });
      winHandle.loadURL(winURL);
    },
    //  导入接收邮箱
    openDialog() {
      this.$electron.remote.dialog.showOpenDialog(
        {
          title: "导入接收邮箱账号",
          properties: ["openFile", "showHiddenFiles"],
          filters: [{ name: "文本类型", extensions: ["txt"] }]
        },
        filePaths => {
          if (filePaths) {
            fs.readFile(filePaths[0], "utf-8", (err, data) => {
              if (err) throw err;
              this.data = [];
              data.split("\n").forEach(item => {
                this.data.push({
                  account: item,
                  status: "未开始"
                });
              });
            });
          }
        }
      );
    },
    //  清空
    reset() {
      const params = {
        message: "是否清空数据？",
        callback: () => {
          this.data = [];
        }
      };
      this.showMesssage(params);
    },
    showMesssage({ type = "info", title = "提示", message, callback }) {
      const params = {
        type,
        title,
        message,
        buttons: ["是", "否"]
      };
      this.$electron.remote.dialog[
        `${type === "info" ? "showMessageBox" : "showErrorBox"}`
      ](params, index => {
        index === 0 && callback && callback();
      });
    },
    openFile({
      title = "提示",
      properties = ["openFile", "showHiddenFiles"],
      filters = [{ name: "文本类型", extensions: ["txt"] }],
      callback
    }) {
      const dialog = this.$electron.remote.dialog;
      dialog.showOpenDialog({ title, properties, filters }, filePaths => {
        if (filePaths) {
          fs.readFile(filePaths[0], "utf8", (err, data) => {
            if (err) {
              throw err;
            }
            // eslint-disable-next-line no-unused-expressions
            callback && callback(data.split(/\n/));
          });
        }
      });
    },
    //  开始发送
    startSend() {
      const selection = this.$refs.selection
          .getSelection()
          .map(item => item.account),
        params = {
          type: "info",
          title: "提示",
          message: `是否对当前${
            selection.length > 0 ? `${selection.length}项选中` : "全部"
          }数据进行操作？`,
          callback: () => {
            const emails =
              selection.length > 0
                ? selection.join(",")
                : this.data.map(item => item.account).join(",");
            const options = {
              account: "44823912@qq.com",
              password: config.pass,
              revicers: emails,
              subject: "测试效果",
              html: `<p>这是一个测试结果<a href="https://www.baidu.com">去百度</a>吧</p>`,
              text: "这是文本信息"
            };
            this.loading = true;
            sendEmail(options).then(({ accepted, rejected }) => {
              accepted.forEach(item => {
                let data = this.data.find(d => d.account === item);
                data.status = "成功";
              });
              rejected.forEach(item => {
                let data = this.data.find(d => d.account === item);
                data.status = "失败";
              });
              this.loading = false;
            });
          }
        };
      this.showMesssage(params);
    },
    //  停止发送
    stopSend() {}
  },
  computed: {
    accountData() {
      return this.$store.state.account.accountData;
    }
  }
};
</script>

<style lang="css">
.status {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  background-color: #d6cccc;
  display: flex;
  border: 1px solid #d8d8d8;
}
.status-item {
  flex: 1;
  height: 30px;
  line-height: 30px;
  padding-left: 10px;
  color: #333;
  border-right: 1px solid #222;
}
.no-radius {
  border-width: 0;
}
</style>
