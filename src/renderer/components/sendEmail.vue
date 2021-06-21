<template>
  <main class="padding-20">
    <Row :gutter="10">
      <Col span="12">
        <div class="margin-bottom-5">
          <Button
            type="primary"
            size="small"
            class="margin-right-2"
            @click="importAccount('send')"
            >导入账号</Button
          >
          <Button
            type="default"
            size="small"
            class="margin-right-2"
            @click="sendAccountData = []"
            >清空账号</Button
          >
          <Button
            type="primary"
            size="small"
            class="margin-right-2"
            @click="sendMail"
            >开始发送</Button
          >
          <Button
            type="primary"
            size="small"
            class="margin-right-2"
            @click="chooseData.isShow = true"
            >导入附件</Button
          >
        </div>
        <Row type="flex" justify="center" align="middle">
          <Table
            width="'100%'"
            height="400"
            border
            :loading="loading"
            :no-data-text="loading ? '正在发送' : '请先导入发送账号'"
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
            :disabled="randomAccount"
            @click="importAccount('receive')"
            >导入账号</Button
          >
          <Button type="default" size="small" @click="receiverAccountData = []"
            >清空账号</Button
          >
          <Checkbox v-model="randomAccount">是否随机账号</Checkbox>
        </div>
        <Row type="flex" justify="center" align="middle">
          <Table
            width="'100%'"
            height="400"
            border
            :loading="loading"
            :no-data-text="loading ? '正在发送' : '请先导入接收账号'"
            :columns="receiverColumns"
            :data="receiverAccountData"
          ></Table>
        </Row>
      </Col>
    </Row>
    <ul class="status-box">
      <li>
        发送账号：<span>{{ account.sendAccount }}</span>
      </li>
      <li>
        接收账号：<span>{{ account.revicers }}</span>
      </li>
      <li>
        发送附件：<span>{{ chooseData.file }}</span>
      </li>
      <li>
        状态：<span>{{ account.status }}</span>
      </li>
    </ul>
    <Modal
      v-model="subjectData.isShow"
      title="请输入邮件主题"
      width="300"
      @on-ok="setSubject"
      @on-cancel="subjectData.value = null"
    >
      <Input
        placeholder="请输入邮件主题..."
        style="width: 260px"
        v-model="subjectData.value"
      />
    </Modal>
    <Modal
      v-model="chooseData.isShow"
      title="请输入附件模式"
      width="300"
      @on-ok="chooseFileType"
    >
      <Select v-model="chooseData.value">
        <Option value="txt" key="text">文本</Option>
        <Option value="html" key="html">超文本</Option>
      </Select>
    </Modal>
  </main>
</template>

<script>
import fs from 'fs';
import sendEmail from '../utils/send-emal';
import { dialog } from '../utils/remote';
export default {
  name: 'send-email',
  data() {
    return {
      loading: false,
      randomAccount:false,
      subjectData:{
        isShow:false,
        value:'', //  主题
      },
      chooseData:{
        isShow:false,
        value:null,  // 类型
        file:null //  内容
      },
      sendColumns: [
        {
          title: '账号',
          width: 150,
          key: 'account',
        },
        {
          title: '密码',
          key: 'password',
          render: h => h('span', '******'),
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => h(
              'Button',
              {
                props: {
                  type: 'primary',
                  size: 'small',
                },
                on: {
                  click: () => {
                    this.sendAccountData.splice(params.index, 1);
                  },
                },
              },
              '删除',
            ),
        },
      ], //  发送账号列名
      receiverColumns: [
        { title: '账号', key: 'account', width: 150 },
        {
          title: '状态',
          key: 'status',
          width: 80,
          render: (h, params) => h(`${params.row.status === '成功' ? 'Icon' : 'span'}`, {
              props: {
                type: `${params.row.status === '成功' ? 'ios-checkmark' : 'ios-close'}`,
                color: `${params.row.status === '成功' ? '#19be6b' : '#ccc'}`,
              },
              style: {
                fontSize: '20px',
                color: '#fff',
                background: `${params.row.status === '成功' ? '#19be6b' : '#ccc'}`,
                borderRadius: '50%',
              },
            }),
        },
        {
          title: '操作',
          align: 'center',
          render: (h, params) => h(
              'Button',
              {
                props: {
                  type: 'primary',
                  size: 'small',
                },
                on: {
                  click: () => {
                    this.receiverAccountData.splice(params.index, 1);
                  },
                },
              },
              '删除',
            ),
        },
      ], //  接收账号列名
      sendAccountData: [], //  发送账号数据
      receiverAccountData: [], //  接收账号数据
    };
  },
  computed:{
    account(){
      return this.$store.state.account;
    }
  },
  methods: {
    //  导入发送账号
    importAccount(type) {
      switch (type) {
        case 'send':
          this.loadAccount((content)=>{
            this.sendAccountData = content.split('\n').map(item=>{
              const [account,password] = item.split('|');
              return {
                account,
                password
              }
            })
          });
          break;
        case 'receive':
          this.loadAccount((content)=>{
            this.receiverAccountData = content.split('\n').map(item=>{
              return {
                account:item
              }
            });
          })
          break;
        default:
          break;
      }
    },
    //  导入账号
    loadAccount(callback) {
      const values = dialog.showOpenDialog({ properties: ['openFile'], message: '请选择文件' });
      if(values){
        const content = fs.readFileSync(values[0],{encoding:'utf8'})
        callback && callback(content);
      }
    },
    //  选择附件
    chooseFileType(){
      const {value} = this.chooseData;
      const filePath = dialog.showOpenDialog({properties:['openFile'],filters:[{name:value === 'text' ? '文本':'超文本',extensions:[`${value}`]}]})
      if(filePath && filePath.length){
        this.chooseData.file = filePath[0];
      }
    },
    async sendMail() {
      if(this.sendAccountData.length === 0){
        return this.$Message.error('请导入发送账号');
      }

      if(!this.randomAccount && this.receiverAccountData.length === 0){
        return this.$Message.error('请导入接收账号');
      }

      if(!this.subjectData.value){
        setTimeout(()=>{
          this.subjectData.isShow = true;
        },1500)
        return this.$Message.error('请输入邮件主题');
      }

      
      if(this.randomAccount){
        this.receiverAccountData = []
      }
      this.sendAccountData.forEach(({account,password})=>{
        const totalAccounts = [...this.receiverAccountData.map(item=>item.account)];
        const {value:subject} = this.subjectData;
        const {value,file} = this.chooseData;
        const config = {
          account,
          password,
          revicers:this.randomAccount ?
          Array.from({length:100},()=>parseInt(Math.random()* 1000000000))
          :totalAccounts.splice(0,100),
          subject,
          [value==='txt'?'text':'html']:fs.readFileSync(file,{encoding:'utf8'})
        }

        if(!config.revicers.length){
          throw Error('当前接收邮件账号为空')
        }
        
        this.$store.commit('account/ADD_ACCOUNT_DATA',config.account);
        this.$store.commit('account/SET_REVICERS_COUNT',config.revicers);
        this.$store.commit('account/ADD_ACCOUNT_DATA','正在发送');
        sendEmail(config).then(value=>{
          console.log(value);
          this.$store.commit('account/ADD_ACCOUNT_DATA','发送成功');
        })
      })
    },
    //  开始发送
    setSubject() {
      this.sendMail();
    }
  },
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
