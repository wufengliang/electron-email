<template>
  <main class="padding-20">
    <Row :gutter="10">
      <Col span="12">
      <div class="margin-bottom-5">
        <Button
          type="primary"
          size="small"
          class="margin-right-2"
          @click="loadSendAccount"
        >导入账号</Button>
        <Button
          type="default"
          size="small"
          class="margin-right-2"
          @click="sendAccountData=[]"
        >清空账号</Button>
        <Button
          type="primary"
          size="small"
          :disabled="sendAccountData.length === 0 || receiverAccountData.length === 0"
          class="margin-right-2"
          @click="sendMail"
        >开始发送</Button>
        <Button
          type="primary"
          size="small"
          class="margin-right-2"
          @click="loadFile"
        >导入附件</Button>
      </div>
      <Row
        type="flex"
        justify="center"
        align="middle"
      >
        <Table
          width="'100%'"
          height="400"
          border
          :loading="loading"
          :no-data-text="loading ? '正在发送':'请先导入发送账号'"
          :columns="sendColumns"
          :data="sendAccountData"
        ></Table>
      </Row>
      </Col>
      <Col span="12">
      <div class="margin-bottom-5">
        <Button
          type="primary"
          size="small"
          class="margin-right-2"
          @click="loadReceiverAccount"
        >导入账号</Button>
        <Button
          type="default"
          size="small"
          @click="receiverAccountData=[]"
        >清空账号</Button>
      </div>
      <Row
        type="flex"
        justify="center"
        align="middle"
      >
        <Table
          width="'100%'"
          height="400"
          border
          :loading="loading"
          :no-data-text="loading?'正在发送':'请先导入接收账号'"
          :columns="receiverColumns"
          :data="receiverAccountData"
        ></Table>
      </Row>
      </Col>
    </Row>
    <ul class="status-box">
      <li>
        发送账号：{{nowSendAccount}}
      </li>
      <li>
        接收账号：{{nowReceiverAccount}}
      </li>
      <li>
        发送附件：{{this.$store.state.account.filePath}}
      </li>
      <li>
        状态：{{nowStatus}}
      </li>
    </ul>
    <Modal
      v-model="isShow"
      title="请输入邮件主题"
      width="300"
    >
      <Input
        v-model="subject"
        placeholder="请输入邮件主题..."
        style="width: 260px"
      ></Input>
      <div slot="footer">
        <Button
          type="primary"
          size="large"
          @click="setSubject"
        >确定</Button>
      </div>
    </Modal>
  </main>
</template>

<script>
import fs from "fs";
import sendEmail from "../utils/send-emal";
export default {
  name: "send-email",
  data() {
    return {
      sendColumns: [
        {
          title: '账号',
          width: 150,
          key: 'account',
        },
        {
          title: '密码',
          key: 'password',
          render: (h) => {
            return h('span', '******');
          }
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'primary',
                size: 'small'
              },
              on: {
                click: () => {
                  this.sendAccountData.splice(params.index, 1);
                }
              }
            }, '删除')
          }
        }
      ],  //  发送账号列名
      receiverColumns: [
        { title: '账号', key: 'account', width: 150, },
        {
          title: '状态',
          key: 'status',
          width: 80,
          render: (h, params) => {
            return h(`${params.row.status === '成功' ? 'Icon' : null}`, {
              props: {
                type: `${params.row.status === '成功' ? 'ios-checkmark' : 'ios-close'}`,
                color: `${params.row.status === '成功' ? '#19be6b' : '#ccc'}`
              },
              style: {
                fontSize: '20px',
                color: '#fff',
                background: `${params.row.status === '成功' ? '#19be6b' : '#ccc'}`,
                borderRadius: '50%'
              }
            })
          }
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'primary',
                size: 'small'
              },
              on: {
                click: () => {
                  this.receiverAccountData.splice(params.index, 1);
                }
              }
            }, '删除')
          }
        }
      ],  //  接收账号列名
      sendAccountData: [],  //  发送账号数据
      receiverAccountData: [],  //  接收账号数据
      nowSendAccount: null,  //  正在发送账号
      nowReceiverAccount: null,  //  正在接收账号
      nowStatus: null,  //  发送状态
      loading: false,  //  loading状态
      subject: null,  //  发送邮件主题
      isShow: false,
    };
  },
  methods: {
    //  导入发送账号
    loadSendAccount() {
      const fn = () => {
        this.showOpenDialog({}).then(
          array => {
            this.sendAccountData = [];
            array.forEach(val => {
              const arr = val.split('-');
              this.sendAccountData.push({
                account: arr[0],
                password: arr[1]
              })
            })
          }
        )
      }
      if (this.sendAccountData.length > 0) {
        this.$Modal.confirm({
          title: '提示',
          content: `是否覆盖当前发送账号？`,
          onOk: () => {
            fn();
          }
        });
        return;
      }

      fn();
    },
    //  导入接收账号
    loadReceiverAccount() {
      this.showOpenDialog({}).then(
        array => {
          this.receiverAccountData = [];
          array.forEach(val => {
            this.receiverAccountData.push({
              account: val,
              status: '未开始'
            })
          })
        }
      )
    },
    //  导入附件
    loadFile() {
      this.showOpenDialog({ title: '导入附件', filters: [{ name: '网页文件', extensions: ['htm', 'html'] }], type: 'file' }).then(
        file => {
          this.$store.dispatch('addFilePath', file);
        }
      )
    },
    sendMail() {
      this.subject = null;
      this.isShow = true;
    },
    //  开始发送
    setSubject() {
      this.isShow = false;
      this.$Modal.confirm({
        title: '提示',
        content: '是否开始发送？',
        onOk: () => {
          const files = this.$store.state.account.filePath;
          fs.readFile(files, 'utf8', (err, html) => {
            if (err) {
              this.$Modal.error({
                title: '提示',
                content: err.message
              })
              return;
            }
            this.loading = true;
            this.sendAccountData.forEach(({ account, password }) => {
              this.nowSendAccount = account;
              let num = 0;
              for (let index = 0; index < this.receiverAccountData.length; index++) {
                const element = this.receiverAccountData[index];
                this.nowReceiverAccount = element.account;
                this.nowStatus = '正在发送...';
                //  每个账号只允许发送300封邮件 超过300个账号就进行下一个账号发送
                if (num > 300) {
                  return false;
                }
                sendEmail({ account, password, revicers: element.account, subject: this.subject, html }).then(
                  () => {
                    this.loading = false;
                    this.nowStatus = '接收成功';
                    element.status = '成功';
                  }
                );
              }
            })
          })
        }
      })
    },
    //  打开文件
    showOpenDialog({ title = '导入接收邮箱账号', properties = ["openFile", "showHiddenFiles"], filters = [{ name: "文本类型", extensions: ["txt"] }], type = 'text' }) {
      const dialog = this.$electron.remote.dialog.showOpenDialog;
      return new Promise((resolve, reject) => {
        dialog({ title, properties, filters }, files => {
          if (files) {
            if (type === 'text' || !type) {
              fs.readFile(files[0], 'utf8', (err, data) => {
                if (err) {
                  reject(err);
                }
                resolve(data.replace(/\n/g, '|').split('|'));
              })
            } else if (type === 'file') {
              resolve(files[0]);
            }
          }
        })
      })
    }
  }
};
</script>

<style lang="scss">
.status-box {
  display: flex;
  align-content: center;
  justify-content: center;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  line-height: 30px;
  background: #dcb7b7;
  color: #fff;
  li {
    flex-grow: 1;
    border-top: 1px solid #a28888;
    border-left: 1px solid #8e7777;
    padding-left: 8px;
    margin-left: -1px;
  }
}
</style>
