<template>
  <main class="padding-20">
    <div class="btn-box">
      <Button
        type="primary"
        size="small"
        :disabled="data.length > 0"
        @click="openDialog"
      >导出文件</Button>
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
      <Button
        type="primary"
        size="small"
        :disabled="data.length === 0"
        class="margin-left-10"
      >停止发送</Button>
    </div>
    <div class="table-box margin-top-10">
      <Table
        border
        :columns="columns"
        :data="data"
        ref="selection"
      ></Table>
    </div>
  </main>
</template>

<script>
import fs from 'fs';
import nodemailer from 'nodemailer';
export default {
  name: 'send-email',
  data() {
    return {
      accountForm: {
        account: null, //  账号
        password: null, //  密码
        loading: true,
      },
      columns: [
        {
          type: 'selection',
          width: 50,
          align: 'center',
        },
        {
          title: '账号',
          key: 'account',
        },
        {
          title: '发送状态',
          key: 'status',
        },
      ],
      data: [],
      filePath: null, // 导入发送的文件
    };
  },
  methods: {
    //  导入邮箱
    openDialog() {
      this.$electron.remote.dialog.showOpenDialog({
        title: '导入邮箱账号',
        properties: ['openFile', 'showHiddenFiles'],
      }, (filePaths) => {
        if (filePaths) {
          fs.readFile(filePaths[0], 'utf-8', (err, data) => {
            if (err) throw err;
            this.data = [];
            data.split('\n').forEach((item) => {
              this.data.push({
                account: item,
                status: '未开始',
              });
            });
          });
        }
      });
    },
    //  清空
    reset() {
      const params = {
        message: '是否清空数据？',
        callback: () => {
          this.data = [];
        }
      }
      this.showMesssage(params);
    },
    showMesssage({ type = 'info', title = '提示', message, callback }) {
      const params = {
        type,
        title,
        message,
        buttons: ['是', '否'],
      }
      this.$electron.remote.dialog[`${type === 'info' ? 'showMessageBox' : 'showErrorBox'}`](params, (index) => {
        index === 0 && callback && callback();
      })
    },
    //  开始发送
    startSend() {
      const selection = this.$refs.selection.getSelection().map(item => item.account),
        params = {
          type: 'info',
          title: '提示',
          message: `是否对当前${selection.length ? selection.length + '项选中' : '全部'}数据进行操作？`,
          callback: () => {

          }
        };
      this.showMesssage(params);
    },
    //  停止发送
    stopSend() {

    },
    /**
      * @param {selection} 发送邮件数组数据
      * @param {subject} 发送邮件主题
      * @param {html} 发送邮件内容 html格式
      * @param {text} 发送邮件内容 文字模式
     */
    sendMail(selection, subject, html) {
      const smtpTransport = nodemailer.createTransport({
        service: 'qq',
        auth: {
          user: this.accountForm.account,
          pass: this.accountForm.password,
          // pass: 'vsbhomznhvqobiah',
        },
      });
      smtpTransport.sendMail({
        from: this.accountForm.account,
        to: selection,
        subject,
        html,
      }, (err, response) => {
        if (err) {
          this.$electron.remote.dialog.showErrorBox('提示', err.message);
        } else {
          const account = response.accepted[0];
          this.data.forEach((item) => {
            if (item.account.includes(account)) {
              item.status = '已接收';
            }
          });
        }
      });
    },
  },
};
</script>

<style lang="css">
</style>
