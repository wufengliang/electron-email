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
      <Poptip
        trigger="hover"
        title="导入文件地址"
        placement="left-end"
        :content="filePath ? filePath : '暂无导入文件'"
      >
        <Button type="primary" size="small" class="margin-left-10" @click="loadFile">导入文件</Button>
      </Poptip>
    </div>
    <div class="table-box margin-top-10">
      <Table border :loading="loading" :columns="columns" :data="data"></Table>
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
import { getData, setData } from "../utils/set-get.data";
export default {
  name: "send-email",
  data() {
    return {
      loading: false, //  表格loading效果图
      accountData: [], //  table表格数据源
      columns: [
        {
          title: "账号",
          key: "account"
        },
        {
          title: "发送状态",
          key: "status"
        }
      ],
      data: [], //  接收账号数据
      fileData: null, // 导入发送的文件
      isStartSend: false
    };
  },
  created() {
    this.accountData = getData("accountData") || [];
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
          this.accountData = array;
          setData("accountData", array);
        }
      };
      this.openFile(params);
    },
    //  查看发送账号
    lookEmail() {
      const window = this.$electron.remote.BrowserWindow,
        winURL = `${location.origin}/#/look-email`,
        winHandle = new window({
          width: 500,
          height: 300,
          useContentSize: false,
          resizable: false,
          autoHideMenuBar: true,
          maximizable: false
        });
      winHandle.webContents.send("accountData", this.accountData);
      winHandle.loadURL(winURL);
      winHandle.on("closed", () => {
        this.accountData = getData("accountData") || [];
      });
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
    //  公共提示框
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
    //  公共打开文件提示框
    openFile({
      title = "提示",
      properties = ["openFile", "showHiddenFiles"],
      filters = [{ name: "文本类型", extensions: ["txt"] }],
      type = "txt",
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
            callback &&
              (type === "txt"
                ? callback(data.split(/\n/), filePaths[0])
                : callback(data, filePaths[0]));
          });
        }
      });
    },
    //  开始发送
    startSend() {
      if (this.isStartSend) {
        return;
      }
      const selection = this.data
        .filter(item => item.status !== "已发送")
        .map(item => item.account);
      params = {
        type: "info",
        title: "提示",
        message: `是否对当前${selection.length}项数据进行操作？`,
        callback: () => {
          for(let n=0;n<this.accountData.length;n++){
            const account = this.accountData[n];
          }
          for (let i = 0; i < selection.length; i++) {
            const item = selection[i];

          }
          const options = {
            account: "账号",
            password: "密码",
            revicers: emails,
            subject: "测试效果",
            html: `<p>这是一个测试结果<a href="https://www.baidu.com">去百度</a>吧</p>`,
            text: "这是文本信息"
          };
          this.loading = true;
        }
      };
      this.showMesssage(params);
    },
    //  停止发送
    stopSend() {
      this.isStartSend = false;
      this.loading = false;
    },
    //  导入文件
    loadFile() {
      const params = {
        title: "请选择导入文件",
        filters: [
          { name: "文本类型", extensions: ["txt"] },
          { name: "网页", extensions: ["html", "htm"] }
        ],
        type: "html",
        callback: (streams, file) => {
          this.fileData = streams;
          this.$store.dispatch("addFilePath", file);
        }
      };
      this.openFile(params);
      console.log(this.$store.state.account.filePath);
    }
  },
  computed: {
    filePath() {
      return this.$store.state.account.filePath;
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
