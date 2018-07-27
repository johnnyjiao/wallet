import React from 'react';
import { connect } from 'react-redux'
import {ProgressBarAndroid,Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,TouchableOpacity,Image,Platform,TextInput,Slider,} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { SegmentedControls } from 'react-native-radio-buttons'
import Echarts from 'native-echarts'
var ScreenWidth = Dimensions.get('window').width;
import {formatterNumber,formatterUnit} from '../../utils/FormatUtil'
import { EasyToast, Toast } from '../../components/Toast';
import { EasyLoading } from '../../components/Loading';
import BaseComponent from "../../components/BaseComponent";
import ProgressBar from '../../components/ProgressBar';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons'

const trackOption = ['最近交易','持量大户'];

@connect(({ram,sticker,wallet}) => ({...ram, ...sticker, ...wallet}))
class Transaction extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
          title: '交易',
          headerTitle: "内存交易",
          headerStyle: {
            paddingTop: Platform.OS == "ios" ? 30 : 20,
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
          },
        //   headerRight: (
        //     // <Button name="share" onPress={() => this._rightTopClick()} >
        //       <View style={{ padding: 15 }}>
        //       <Image source={UImage.share_i} style={{ width: 22, height: 22 }}></Image>
        //       </View>
        //     // </Button>
        //   )
        };
      };

  constructor(props) {
    super(props);

    this.state = {
      selectedSegment:"2小时",
      selectedTrackSegment: trackOption[0],

      isBuy: true,
      isSell: false,
      isTxRecord: false,
      isTrackRecord: false,

      balance: '0.0000',   
      slideCompletionValue: 0,
      buyRamAmount: "0.00",    //输入购买的额度
      eosToBytes: '0',
      bytesToEos: '0.00',
      sellRamBytes: "0",    //输入出售的字节数
      queryaccount:"",     //查询账户 
      myRamAvailable: '0', // 我的可用字节
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
   };
  }

  _rightTopClick = () => {
    // DeviceEventEmitter.emit(
    //   "turninShare",
    //   '{"toaccount":"' +
    //     this.props.defaultWallet.account +
    //     '","amount":"' +
    //     this.state.amount +
    //     '","symbol":"EOS"}'
    // );
  };

  componentWillMount() {

    super.componentWillMount();

    // this.props.dispatch({type: 'ram/clearRamPriceLine',payload:{}});
  }

  componentDidMount(){

    // 获取内存市场相关信息
    EasyLoading.show();
    this.props.dispatch({type: 'ram/getRamInfo',payload: {}, callback: () => {
        EasyLoading.dismis();
    }});

    // 默认获取2小时K线图
    this.fetchLine(2,'2小时');
   
    // 获取钱包信息和余额
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" }, callback: () => {
        if (this.props.defaultWallet == null || this.props.defaultWallet.name == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
            return;
          }
        this.getAccountInfo();
        this.getBalance();
    }});
    
    DeviceEventEmitter.addListener('getRamInfoTimer', (data) => {
        this.getRamInfo();
        this.getBalance();
        if(this.state.isTxRecord && this.state.queryaccount != null && this.state.queryaccount != ''){
            this.getRamTradeLog();
        }else{
            this.getRamTradeLogByAccount(this.state.queryaccount);
        }
        if(this.state.selectedTrackSegment == trackOption[0]) {
            this.getRamBigTradeLog();
        }
    });

  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  getRamInfo(){
    this.props.dispatch({type: 'ram/getRamInfo',payload: {}});

    // 获取曲线
    this.setSelectedOption(this.state.selectedSegment);
  }

  getRamTradeLog(){
    this.props.dispatch({type: 'ram/getRamTradeLog',payload: {}});    
  }

  getRamTradeLogByAccount(accountName){
    this.props.dispatch({type: 'ram/getRamTradeLogByAccount',payload: {account_name: accountName}});    
  }

  getRamBigTradeLog(){
    this.props.dispatch({type: 'ram/getRamBigTradeLog',payload: {}});    
  }

  getAccountInfo(){
    this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account},callback: (data) => {
      this.setState({ myRamAvailable:((data.total_resources.ram_bytes - data.ram_usage)).toFixed(0)});
          this.getInitialization(); 
    } });
  } 

  getInitialization() {
    if(this.state.isBuy){
        this.goPage('isBuy');
      }else if(this.state.isSell){
        this.goPage('isSell');
      }else{
      }   
  }

  fetchLine(type,opt){
    this.setState({selectedSegment:opt});
    InteractionManager.runAfterInteractions(() => {
        this.props.dispatch({type:'ram/getRamPriceLine',payload:{type}});
    });
  }

  setSelectedOption(opt){
    if(opt=="2小时"){
      this.fetchLine(2,opt);
    }else if(opt=="6小时"){
      this.fetchLine(6,opt);
    }else if(opt=="24小时"){
      this.fetchLine(24,opt);
    }else if(opt=="48小时"){
      this.fetchLine(48,opt);
    }
  }

  fetchTrackLine(type,opt){
    this.setState({selectedTrackSegment:opt});
    if(type == 0){
        EasyLoading.show();
        this.props.dispatch({type: 'ram/getRamBigTradeLog',payload: {}, callback: () => {
            EasyLoading.dismis();
        }});    
    }else{
        EasyToast.show('开发中，查询区块持量大户前10名记录');   
    }
  }

  setSelectedTrackOption(opt){
    if(opt== trackOption[0]){
      this.fetchTrackLine(0,opt);
    }else {
      this.fetchTrackLine(1,opt);
    }
  }

  setEosBalance(balance){
    if (balance == null || balance == "") {
        this.setState({balance: '0.0000'});
      } else {
          this.setState({ balance: balance.replace("EOS", "") });
      }
  }

  getBalance() {
    if (this.props.defaultWallet == null || this.props.defaultWallet.name == null || !this.props.defaultWallet.isactived || !this.props.defaultWallet.hasOwnProperty('isactived')) {
      return;
    }
    this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.name, symbol: 'EOS' }, callback: (data) => {
          if (data.code == '0') {
            this.setEosBalance(data.data);
          }
        }
      })
}

  goPage(current) {
    if (current == 'isBuy'){
        // EasyToast.show('买');
    }else if (current == 'isSell'){
        // EasyToast.show('卖');
    }else if (current == 'isTxRecord'){
        //  EasyToast.show('待实现,查询区块最近的20笔交易记录');
        EasyLoading.show();
        this.props.dispatch({type: 'ram/getRamTradeLog',payload: {}, callback: () => {
            EasyLoading.dismis();
        }});    

    }
    else if (current == 'isTrackRecord'){
        EasyLoading.show();
        this.props.dispatch({type: 'ram/getRamBigTradeLog',payload: {}, callback: () => {
            EasyLoading.dismis();
        }});   
    } 
    // EasyLoading.dismis(); 
 }
   // 更新"买，卖，交易记录，大单追踪"按钮的状态  
   _updateBtnState(currentPressed, array) { 
    if (currentPressed === 'undefined' || currentPressed === null || array === 'undefined' || array === null ) {  
        return;  
    }  
    let newState = {...this.state};  
    for (let type of array) {  
        if (currentPressed == type) {  
            newState[type] ? {} : newState[type] = !newState[type];  
            this.setState(newState);  
        } else {  
            newState[type] ? newState[type] = !newState[type] : {};  
            this.setState(newState);  
        }  
    } 
    this.goPage(currentPressed);
  }  

  funcButton(style, selectedSate, stateType, buttonTitle) {  
    let BTN_SELECTED_STATE_ARRAY = ['isBuy', 'isSell','isTxRecord', 'isTrackRecord'];  
    return(  
        <TouchableOpacity style={[style, selectedSate ? {backgroundColor:this.transformColor(stateType)} : {backgroundColor: UColor.mainColor}]}  onPress={ () => {this._updateBtnState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
            <Text style={[styles.tabText, selectedSate ? {color: UColor.fontColor} : {color: '#7787A3'}]}>{buttonTitle}</Text>  
        </TouchableOpacity>  
    );  
  } 
  transformColor(currentPressed) {
      if(currentPressed == 'isBuy'){
        return '#42B324';
      }else if(currentPressed == 'isSell'){
        return UColor.showy;
      }else{
        return UColor.tintColor;
      }
  }


  chkAccount(obj) {
      var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
      for(var i = 0 ; i < obj.length;i++){
          var tmp = obj.charAt(i);
          for(var j = 0;j < charmap.length; j++){
              if(tmp == charmap.charAt(j)){
                  break;
              }
          }
          if(j >= charmap.length){
              //非法字符
              obj = obj.replace(tmp, ""); 
              EasyToast.show('请输入正确的账号');
          }
      }
      return obj;
  }

  chkPrice(obj) {
      obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
      obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
      obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
      obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
      obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
      var max = 9999999999.9999;  // 100亿 -1
      var min = 0.0000;
      var value = 0.0000;
      try {
      value = parseFloat(obj);
      } catch (error) {
      value = 0.0000;
      }
      if(value < min|| value > max){
      EasyToast.show("输入错误");
      obj = "";
      }
      return obj;
  }

  //转换时间
  transferTimeZone(date){
      //转换时间
      let timezone = moment(date).add(8,'hours').format('YYYY-MM-DD HH:mm:ss');
      let regEx = new RegExp("\\-","gi");
      let validDateStr=timezone.replace(regEx,"/");
      let milliseconds=Date.parse(validDateStr);
      let sendTime = new Date(milliseconds).getTime();
      //当前时间
      let nowTime = new Date().getTime();
      //72小时
      let ThreeTime = 259200000;
      //差值
      let Dvalue = nowTime - sendTime ;
      let SurplusTime = ThreeTime - Dvalue
      // 时 
      const hours = Math.floor(SurplusTime / (3600 * 1000)); 
      // 分 
      const leave2 = SurplusTime % (3600 * 1000); 
      const minutes = Math.floor(leave2 / (60 * 1000)); 
      // 秒 
      const leave3 = leave2 % (60 * 1000); 
      const seconds = Math.round(leave3 / 1000); 
      let Surplus = hours + ':' + minutes + ':' + seconds
      return Surplus;
  }

  chkAmountIsZero(amount,errInfo)
  {
      var tmp;
      try {
           tmp = parseFloat(amount);
        } catch (error) {
            tmp = 0;
        }
      if(tmp <= 0){
          EasyToast.show(errInfo);
          return true;
      }
      return false;
  }
  
  // 根据账号查找交易记录
  getRamLogByAccout = (rowData) =>{
    if(this.state.queryaccount == null|| this.state.queryaccount == ''){
        EasyLoading.show();
        this.props.dispatch({type: 'ram/getRamTradeLog',payload: {}, callback: () => {
            EasyLoading.dismis();
        }});  
        return;
    }
    EasyLoading.show();
    this.props.dispatch({type: 'ram/getRamTradeLogByAccount',payload: {account_name: this.state.queryaccount}, callback: (resp) => {
        EasyLoading.dismis();
        if(resp.code != '0' || ((resp.code == '0') && (this.props.ramTradeLog.length == 0))){
            EasyToast.show("未找到交易哟~");
        }
    }});    
  }

  // 购买内存
  buyram = (rowData) => { 
    if(!this.props.defaultWallet){
        EasyToast.show('请先创建钱包');
        return;
    }
    if(this.state.buyRamAmount == ""){
        EasyToast.show('请输入购买金额');
        return;
    }
    if(this.chkAmountIsZero(this.state.buyRamAmount,'请输入购买金额')){
        this.setState({ buyRamAmount: "" })
        return ;
    }
    this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            <Text style={styles.inptpasstext}></Text>  
        </View>
        EasyDialog.show("请输入密码", view, "确认", "取消", () => {
        if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
            EasyToast.show('密码长度至少4位,请重输');
            return;
        }
        var privateKey = this.props.defaultWallet.activePrivate;
        try {
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                EasyLoading.show();
                if(this.state.isOwn){
                    this.state.receiver = this.props.defaultWallet.account;
                }
                Eos.buyram(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver, this.state.buyRamAmount + " EOS", (r) => {
                    EasyLoading.dismis();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("购买成功");
                    }else{
                        if(r.data){
                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("购买失败");
                            }
                        }else{
                            EasyToast.show("购买失败");
                        }
                    }
                });
            } else {
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
        } catch (e) {
            EasyLoading.dismis();
            EasyToast.show('未知异常');
        }
        EasyDialog.dismis();
    }, () => { EasyDialog.dismis() });
};
  // 出售内存
  sellram = (rowData) => {
    if(!this.props.defaultWallet){
        EasyToast.show('请先创建钱包');
        return;
    }
    if(this.state.sellRamBytes == ""){
        EasyToast.show('请输入出售内存字节数量');
        return;
    }
    if(this.chkAmountIsZero(this.state.sellRamBytes,'请输入出售内存kb数量')){
        this.setState({ sellRamBytes: "" })
        return ;
    }
    this. dismissKeyboardClick();
        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            <Text style={styles.inptpasstext}></Text>  
        </View>
        EasyDialog.show("请输入密码", view, "确认", "取消", () => {
        if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
            EasyToast.show('密码长度至少4位,请重输');
            return;
        }
        var privateKey = this.props.defaultWallet.activePrivate;
        try {
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                EasyLoading.show();
                Eos.sellram(plaintext_privateKey, this.props.defaultWallet.account, this.state.sellRamBytes, (r) => {
                    EasyLoading.dismis();
                    if(r.isSuccess){
                        this.getAccountInfo();
                        EasyToast.show("出售成功");
                    }else{
                        if(r.data){
                            if(r.data.msg){
                                EasyToast.show(r.data.msg);
                            }else{
                                EasyToast.show("出售失败");
                            }
                        }else{
                            EasyToast.show("出售失败");
                        }
                    }
                });
                
            } else {
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
        } catch (e) {
            EasyLoading.dismis();
            EasyToast.show('未知异常');
        }
        EasyDialog.dismis();
    }, () => { EasyDialog.dismis() });
  };

    dismissKeyboardClick() {
      dismissKeyboard();
  }

  getTextPromp(){
    var info = "大单>2000 中单500-200 小单<500";
    return info;
  }

  //输入购买数量占总余额的比例
  getBuyRamRadio(balance)
  {
    //  var balance = this.state.balance == ""? "0.0000" :this.state.balance;
    //  var ratio = 0;             //进度条比例值
    //  try {
    //     if(this.state.buyRamAmount){
    //         if(balance){
    //             //余额存在且大于0
    //             var tmpbuyRamAmount = 0;
    //             var tmpbalance = 0; 
    //             try {
    //                 tmpbuyRamAmount = parseFloat(this.state.buyRamAmount);
    //                 tmpbalance = parseFloat(balance);
    //               } catch (error) {
    //                 tmpbuyRamAmount = 0;
    //                 tmpbalance = 0;
    //             }
    //             if(tmpbuyRamAmount > tmpbalance)
    //             {
    //                 //余额不足
    //                 this.setState({buyRamAmount:""});         
    //                 EasyToast.show("您的余额不足,请重输");           
    //             }else if(tmpbalance > 0){
    //                 ratio = tmpbuyRamAmount / tmpbalance;
    //             }
    //         }
    //     }
    //  } catch (error) {
    //     ratio = 0;
    //  }
    //  return ratio;
  }
  //输入卖掉的字节数占总字节的比例
  getSellRamRadio()
  {
     var ratio = 0;             //进度条比例值
     try {
         if(this.state.sellRamBytes)
         {
             if(this.state.myRamAvailable){
                //可用字节数存在且大于0
                var tmpsellRamBytes = 0;
                var tmpram_available = 0; 
                try {
                    tmpsellRamBytes = parseFloat(this.state.sellRamBytes);
                    tmpram_available = parseFloat(this.state.myRamAvailable);
                  } catch (error) {
                    tmpsellRamBytes = 0;
                    tmpram_available = 0;
                  }
                if(tmpsellRamBytes > tmpram_available)  
                {
                    //余额不足
                    this.setState({sellRamBytes:""});   
                    EasyToast.show("您的余额不足,请重输");        
                }else if(tmpram_available > 0){
                    ratio = tmpsellRamBytes / tmpram_available;
                } 
             }
         }
     } catch (error) {
        ratio = 0;
     }
     return ratio;
  }

  eosToBytes(eos, currentPrice) {
    if(eos == null || eos == '' || currentPrice == null || currentPrice == ''){
        return '0';
    }
    return ((eos/currentPrice) * 1024).toFixed(0); 
  }

  bytesToEos(bytes, currentPrice){
    if(bytes == null || bytes == '' || currentPrice == null || currentPrice == ''){
        return '0.00';
    }
    return ((bytes * currentPrice) / 1024).toFixed(2);
  }
  render() {
    return <View style={styles.container}>
            <Toast ref="toast"/>

     <ScrollView style={styles.scrollView}>
      <View>
          <View style={{flex:1,flexDirection:'row',alignItems:'center' }}>
            <View style={{flexDirection:"column",flexGrow:1}}>
              <View style={{flex:1,flexDirection:'row',alignItems:'center' }}>
                <Text style={{color:'#8696B0',fontSize:11,textAlign:'center', marginLeft:10}}>开盘   </Text>
                <Text style={{color:'#fff',fontSize:11,textAlign:'center', marginLeft:10}}>{this.props.ramInfo ? this.props.ramInfo.open : '0'} EOS/KB</Text>
              </View>
              <View style={{flexDirection:"row",flexGrow:1}}>
                <Text style={{color:'#8696B0',fontSize:11,marginTop:2,textAlign:'center', marginLeft:10}}>内存占比</Text>
                <Text style={{color:'#fff',fontSize:11,marginTop:2,textAlign:'center', marginLeft:10}}>{this.props.ramInfo ? this.props.ramInfo.usage_ram : 0} GB/{this.props.ramInfo ? this.props.ramInfo.total_ram : 0} GB</Text>
                <Text style={{color:'#8696B0',fontSize:11,marginTop:2,textAlign:'center'}}> ({((this.props.ramInfo ? this.props.ramInfo.usage_ram_percent : '0') * 100).toFixed(2)}%)</Text>
              </View>
              <View style={{flexDirection:"row",flexGrow:1}}>
                <Text style={{color:'#8696B0',fontSize:11,marginTop:2,textAlign:'center', marginLeft:10}}>总资金</Text>
                <Text style={{color:'#fff',fontSize:11,marginTop:2,textAlign:'center', marginLeft:10}}>{this.props.ramInfo ? this.props.ramInfo.total_eos : '0'} EOS</Text>
              </View>
            </View>
            <View style={{flexDirection:'column',flexGrow:1}}>
                <View style={{flex:1,flexDirection:'row', alignItems:'center' }}>
                    <Text style={{color:'#8696B0',fontSize:13,textAlign:'center', marginLeft:10}}>涨幅 </Text>
                    <Text style={(this.props.ramInfo && this.props.ramInfo.increase>=0)?styles.incdo:styles.incup}> {this.props.ramInfo ? (this.props.ramInfo.increase > 0 ? '+' + (this.props.ramInfo.increase * 100).toFixed(2) : (this.props.ramInfo.increase * 100).toFixed(2)): '0.00'}%</Text>
                </View>
                <View style={{flex:1,flexDirection:'row', alignItems:'center' }}>
                    <Text style={{color:'#8696B0',fontSize:13,textAlign:'center', marginLeft:10}}>当前价格</Text>
                    <Text style={{color:'#fff',fontSize:20,marginTop:2,textAlign:'center'}}> {this.props.ramInfo ? this.props.ramInfo.price : '0.00'}</Text>
                </View>
            </View>
          </View>
        
        <View style={{padding:10,paddingTop:5}}>
          <SegmentedControls 
          tint= {'#586888'}
          selectedTint= {'#43536D'}
          onSelection={this.setSelectedOption.bind(this) }
          selectedOption={ this.state.selectedSegment }
          backTint= {'#43536D'} options={['2小时','6小时','24小时','48小时']} />
        </View>
        <View style={{flex:1,paddingTop:10}}>
          {
            <Echarts option={this.props.ramLineDatas?this.props.ramLineDatas:{}} width={ScreenWidth} height={160} />
          }
        </View>
        {/* <View style={{justifyContent:'center',alignItems:'center',flexDirection:'row'}}>
            <View style={{width:8,height:8,borderRadius:4,backgroundColor:'#65CAFF'}}></View>
            <Text style={{color:'#8696B0',fontSize:11,marginLeft:5}}>价格走势</Text>
            <View style={{width:8,height:8,borderRadius:4,backgroundColor:'#556E95',marginLeft:10}}></View>
            <Text style={{color:'#8696B0',fontSize:11,marginLeft:5}}>交易量</Text>
        </View> */}
        <View style={styles.tablayout}>  
            {this.funcButton(styles.buttontab, this.state.isBuy, 'isBuy', '买')}  
            {this.funcButton(styles.buttontab, this.state.isSell, 'isSell', '卖')}  
            {this.funcButton(styles.buttontab, this.state.isTxRecord, 'isTxRecord', '交易记录')}  
            {this.funcButton(styles.buttontab, this.state.isTrackRecord, 'isTrackRecord', '大单追踪')}  
        </View> 
         {this.state.isBuy?<View>
              <Text style={styles.inptTitle}>余额:{this.state.balance==""? "0.0000" :this.state.balance}EOS</Text>
              <View style={{height: 30, marginHorizontal: 18, marginBottom: 10, paddingHorizontal: 10, justifyContent: 'center', flexDirection: 'row', alignItems: 'center',backgroundColor:'#38465C',borderRadius:5,}}>
                  <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyRamAmount + ''} returnKeyType="go" 
                  selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow} 
                  placeholder="输入购买的额度" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                  onChangeText={(buyRamAmount) => this.setState({ buyRamAmount: this.chkPrice(buyRamAmount), eosToBytes: this.eosToBytes(buyRamAmount, this.props.ramInfo?this.props.ramInfo.price:'')})}
                  />
                <Text style={{ fontSize: 15, color:UColor.fontColor, }}>EOS</Text>
              </View>
              <View style={{height: 30, marginHorizontal: 18, marginBottom: 10, paddingHorizontal: 10, justifyContent: 'center', flexDirection: 'row', alignItems: 'center',backgroundColor:'#38465C',borderRadius:5,}}>
                  <Text style={{ flex: 1, color: UColor.arrow, fontSize: 15, paddingLeft: 10, }}>≈{this.state.eosToBytes}</Text>
                  <Text style={{ fontSize: 15, color:UColor.fontColor, }}>byte</Text>
              </View>
              <View style={styles.inptoutsource}>
            
                <View style={styles.outsource}>
                    <View style={{flex: 1,}}>
                        <Slider 
                        maximumValue={this.state.balance*1}
                        minimumValue={0}
                        step={0.0001}
                        value={this.state.buyRamAmount*1}
                        onSlidingComplete={(value)=>this.setState({buyRamAmount:value})}
                        maximumTrackTintColor={UColor.tintColor}
                        minimumTrackTintColor={UColor.tintColor}
                        //android
                        thumbTintColor={UColor.tintColor}
                        //ios
                        // trackImage={UImage.progressbar_a}
                        // minimumTrackImage={UImage.progressbar_a}
                        // maximumTrackImage={UImage.progressbar_b}
                        />
                        <View style={{height: 30, flexDirection: 'row', paddingHorizontal: Platform.OS == 'ios' ? 0:15, justifyContent:'space-between',alignItems: 'center', }}>
                            <Text style={{fontSize: 12, color:UColor.arrow }}>0</Text>
                            <Text style={{fontSize: 12, color:UColor.arrow }}>1/3</Text>     
                            <Text style={{fontSize: 12, color:UColor.arrow }}>2/3</Text>
                            <Text style={{fontSize: 12, color:UColor.arrow }}>ALL</Text>                                
                        </View>    
                    </View>
                    <Button onPress={this.buyram.bind()}>
                        <View style={styles.botn}>
                            <Text style={styles.botText}>买入</Text>
                        </View>
                    </Button> 
                </View>
              </View>
          </View>:  
               <View>{this.state.isSell?
                  <View>
                  <Text style={styles.inptTitle}>可卖:{this.state.myRamAvailable}byte</Text>
                  <View style={{height: 30, marginHorizontal: 18, marginBottom: 10, paddingHorizontal: 10, justifyContent: 'center', flexDirection: 'row', alignItems: 'center',backgroundColor:'#38465C',borderRadius:5,}}>
                      <TextInput ref={(ref) => this._rrpass = ref} value={this.state.sellRamBytes + ''} returnKeyType="go" 
                      selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                      placeholder="输入出售数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                      onChangeText={(sellRamBytes) => this.setState({ sellRamBytes: this.chkPrice(sellRamBytes), bytesToEos: this.bytesToEos(sellRamBytes, this.props.ramInfo?this.props.ramInfo.price:'')})}
                      />
                      <Text style={{ fontSize: 15, color:UColor.fontColor, }}>byte</Text>
                  </View>
                  <View style={{height: 30, marginHorizontal: 18, marginBottom: 10, paddingHorizontal: 10, justifyContent: 'center', flexDirection: 'row', alignItems: 'center',backgroundColor:'#38465C',borderRadius:5,}}>
                      <Text style={{ flex: 1, color: UColor.arrow, fontSize: 15, height: 30, paddingLeft: 10, }}>≈{this.state.bytesToEos}</Text>
                      <Text style={{ fontSize: 15, color:UColor.fontColor, }}>EOS</Text>
                  </View>
                  <View style={styles.inptoutsource}>
                        <View style={styles.outsource}>
                            <View style={{flex: 1,}}>
                                <Slider 
                                    maximumValue={this.state.myRamAvailable*1}
                                    minimumValue={0}
                                    step={1}
                                    value={this.state.sellRamBytes*1}
                                    onSlidingComplete={(value)=>this.setState({sellRamBytes:value})}
                                    maximumTrackTintColor={UColor.tintColor}
                                    minimumTrackTintColor={UColor.tintColor}
                                    //android
                                    thumbTintColor={UColor.tintColor}
                                    //ios
                                    // trackImage={UImage.progressbar_a}
                                    // minimumTrackImage={UImage.progressbar_a}
                                    // maximumTrackImage={UImage.progressbar_b}
                                    />
                                <View style={{height: 30, flexDirection: 'row', paddingHorizontal: Platform.OS == 'ios' ? 0:15, justifyContent:'space-between',alignItems: 'center', }}>
                                    <Text style={{fontSize: 12, color:UColor.arrow }}>0</Text>
                                    <Text style={{fontSize: 12, color:UColor.arrow }}>1/3</Text>     
                                    <Text style={{fontSize: 12, color:UColor.arrow }}>2/3</Text>
                                    <Text style={{fontSize: 12, color:UColor.arrow }}>ALL</Text>                                
                                </View> 
                            </View>
                            <Button onPress={this.sellram.bind()}>
                                <View style={styles.botn}>
                                    <Text style={styles.botText}>卖出</Text>
                                </View>
                            </Button> 
                        </View>
                </View>
            </View>:
                <View>{this.state.isTxRecord ? <View >
                   <View style={{flexDirection: 'row', alignItems: 'center',borderBottomColor: UColor.secdColor, marginBottom: 10, }}>
                    <View style={{flex: 1, height: 30, marginHorizontal: 18, paddingHorizontal: 10, justifyContent: 'center', flexDirection: 'row', alignItems: 'center',backgroundColor:'#38465C',borderRadius:5,}}>
                      <TextInput ref={(ref) => this._account = ref} value={this.state.queryaccount} returnKeyType="go"
                            selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} maxLength={12}
                            placeholder="请输入账户名称" underlineColorAndroid="transparent" keyboardType="default" 
                            onChangeText={(queryaccount) => this.setState({ queryaccount: this.chkAccount(queryaccount)})}
                        />
                    </View>     
                    <TouchableOpacity onPress={this.getRamLogByAccout.bind()}>  
                        <View style={{justifyContent: 'flex-end',paddingRight: 15}} >
                            <Image source={UImage.Magnifier} style={{ width: 30,height: 30}}></Image>
                        </View>
                    </TouchableOpacity> 
                 </View>
                 <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                    dataSource={this.state.dataSource.cloneWithRows(this.props.ramTradeLog == null ? [] : this.props.ramTradeLog)} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                    <View>
                        <View style={{ height: Platform.OS == 'ios' ? 84.5 : 65,
                                       backgroundColor: UColor.mainColor,
                                      flexDirection: "row",paddingHorizontal: 20,justifyContent: "space-between",
                                      borderRadius: 5,margin: 5,}}>
                            <View style={{ flex: 1,flexDirection: "row",alignItems: 'center',justifyContent: "center",}}>
                                <View style={{ flex: 1,flexDirection: "column",justifyContent: "flex-end",}}>
                                    <Text style={{fontSize: 15,color: UColor.fontColor,}}>{rowData.payer}</Text>
                                    <Text style={{fontSize: 15,color: UColor.arrow,}}>{rowData.record_date}</Text>
                                </View>
                                <View style={{flexDirection: "column",justifyContent: "flex-end",}}>
                                    {rowData.action_name == 'sellram' ? 
                                    <Text style={{fontSize: 14,color: '#F25C49',textAlign: 'center'}}>卖 {rowData.eos_qty}</Text>
                                    :
                                    <Text style={{fontSize: 14,color: "#4ed694",textAlign: 'center'}}>买 {rowData.eos_qty}</Text>
                                    }
                                    <Text style={{ fontSize: 14,color: UColor.arrow,textAlign: 'center',marginTop: 3}}>{rowData.price} EOS/KB</Text>
                                </View>
                            </View>
                            <View style={{ width: 30,justifyContent: 'center',alignItems: 'flex-end'}}>
                                <Ionicons style={{ color: UColor.arrow,   }} name="ios-arrow-forward-outline" size={20} /> 
                            </View>
                        </View>
                    </View>         
                     )}                
                 /> 
                 
            </View>: 
                 <View>

                 <View style={{padding:10,paddingTop:5}}>
                  <SegmentedControls 
                  tint= {'#586888'}
                  selectedTint= {'#43536D'}
                  onSelection={this.setSelectedTrackOption.bind(this) }
                  selectedOption={ this.state.selectedTrackSegment }
                  backTint= {'#43536D'} options={trackOption} />
                </View>
                {this.state.selectedTrackSegment == trackOption[0] ? 
                  <View>
                    <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                      dataSource={this.state.dataSource.cloneWithRows(this.props.ramBigTradeLog == null ? [] : this.props.ramBigTradeLog)} 
                      renderRow={(rowData, sectionID, rowID) => (                 
                      <View>
                          <View style={{ height: Platform.OS == 'ios' ? 84.5 : 65,
                                        backgroundColor: UColor.mainColor,
                                        flexDirection: "row",paddingHorizontal: 20,justifyContent: "space-between",
                                        borderRadius: 5,margin: 5,}}>
                              <View style={{ flex: 1,flexDirection: "row",alignItems: 'center',justifyContent: "center",}}>
                                  <View style={{ flex: 1,flexDirection: "column",justifyContent: "flex-end",}}>
                                      <Text style={{fontSize: 15,color: UColor.fontColor,}}>{rowData.payer}</Text>
                                      <Text style={{fontSize: 15,color: UColor.arrow,}}>{rowData.record_date}</Text>
                                  </View>
                                  <View style={{flexDirection: "column",justifyContent: "flex-end",}}>
                                      {rowData.action_name == 'sellram' ? 
                                      <Text style={{fontSize: 14,color: '#F25C49',textAlign: 'center'}}>卖 {rowData.eos_qty}</Text>
                                      :
                                      <Text style={{fontSize: 14,color: "#4ed694",textAlign: 'center'}}>买 {rowData.eos_qty}</Text>
                                      }
                                      <Text style={{ fontSize: 14,color: UColor.arrow,textAlign: 'center',marginTop: 3}}>{rowData.price} EOS/KB</Text>
                                  </View>
                              </View>
                              <View style={{ width: 30,justifyContent: 'center',alignItems: 'flex-end'}}>
                                  <Ionicons style={{ color: UColor.arrow,   }} name="ios-arrow-forward-outline" size={20} /> 
                              </View>
                          </View>
                      </View>         
                      )}                
                  /> 
                  </View> :
                  <View>
                      <ListView style={{flex: 1,}} renderRow={this.renderRow} enableEmptySections={true} 
                        dataSource={this.state.dataSource.cloneWithRows(this.props.ramBigTradeLog == null ? [] : this.props.ramBigTradeLog)} 
                        renderRow={(rowData, sectionID, rowID) => (                 
                        <View>
                            <View style={{ height: Platform.OS == 'ios' ? 84.5 : 65,
                                          backgroundColor: UColor.mainColor,
                                          flexDirection: "row",paddingHorizontal: 20,justifyContent: "space-between",
                                          borderRadius: 5,margin: 5,}}>
                                <View style={{ flex: 1,flexDirection: "row",alignItems: 'center',justifyContent: "center",}}>
                                    <View style={{ flex: 1,flexDirection: "column",justifyContent: "flex-end",}}>
                                        <Text style={{fontSize: 15,color: UColor.fontColor,}}>{rowData.payer}</Text>
                                        <Text style={{fontSize: 15,color: UColor.arrow,}}>{rowData.record_date}</Text>
                                    </View>
                                    <View style={{flexDirection: "column",justifyContent: "flex-end",}}>
                                        {rowData.action_name == 'sellram' ? 
                                        <Text style={{fontSize: 14,color: UColor.tintColor,textAlign: 'center'}}>卖 {rowData.eos_qty}</Text>
                                        :
                                        <Text style={{fontSize: 14,color: "#4ed694",textAlign: 'center'}}>买 {rowData.eos_qty}</Text>
                                        }
                                        <Text style={{ fontSize: 14,color: UColor.arrow,textAlign: 'center',marginTop: 3}}>{rowData.price} EOS/KB</Text>
                                    </View>
                                </View>
                                <View style={{ width: 30,justifyContent: 'center',alignItems: 'flex-end'}}>
                                    <Ionicons style={{ color: UColor.arrow,   }} name="ios-arrow-forward-outline" size={20} /> 
                                </View>
                            </View>
                        </View>         
                        )}                
                    /> 
                  </View>
                }
                  {/* <Text style={{fontSize: 14,color: UColor.fontColor,lineHeight: 15,paddingHorizontal: 25,textAlign: "center"}}>成交资金分布</Text>
                  <Text style={{fontSize: 12,color: UColor.tintColor,lineHeight: 15,paddingHorizontal: 25,textAlign: "left"}}>{this.getTextPromp()}</Text> */}
                  {/* <View style={{flex:1,paddingTop:1}}>
                    {
                      <Echarts option={
                   {
                            title : {
                                text: '成交资金分布',
                                textStyle: {
                                    align: 'center',
                                    color: UColor.fontColor,
                                    fontSize: 14,
                                },
                                subtext: "大单>2000 中单500-200 小单<500",
                                subtextStyle:{
                                    align: 'left',
                                }
                            },
                            // tooltip : {
                            //     trigger: 'item',
                            //     formatter: "{a} <br/>{b} : {c} ({d}%)"
                            // },
                            legend: {
                                orient: 'vertical',
                                left: 'right',
                                top: 'middle',
                                data: ['超大','大单','大中','中单','中小','小单']
                            },
                            series : [
                                {
                                    name: '',   //访问来源
                                    type: 'pie',
                                    radius : ['40%', '70%'],
                                    center: ['35%', '60%'],
                                    hoverAnimation: false,
                                    animation:false,
                                    roam:false,
                                    silent:true,
                                    label:{
                                        show: true,
                                        position: 'inner',
                                    },
                                    data:[
                                        {value:335, name:'超大'},
                                        {value:310, name:'大单'},
                                        {value:234, name:'大中'},
                                        {value:135, name:'中单'},
                                        {value:1548, name:'中小'},
                                        {value:1548, name:'小单'}
                                    ],
                                    itemStyle: {
                                        emphasis: {
                                            shadowBlur: 10,
                                            shadowOffsetX: 0,
                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                    }
                                }
                            ]
                        }
                        
                        } width={ScreenWidth - 10} height={200} />
                    }
                  </View> */}
                 </View>}
               </View>}
            </View>
          }   
      </View>
    </ScrollView>
  </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: UColor.secdColor,
  },
  scrollView: {
   
  },
  row:{
    flex:1,
    backgroundColor:UColor.mainColor,
    flexDirection:"row",
    padding: 20,
    borderBottomColor: UColor.secdColor,
    borderBottomWidth: 0.6,
  
  },
  left:{
    width:'25%',
    flex:1,
    flexDirection:"column"
  },
  right:{
    width:'85%',
    flex:1,
    flexDirection:"column"
  },
  incup:{
    fontSize:20,
    color:'#F25C49',
    textAlign:'center',
    marginTop:2,
  },
  incdo:{
    fontSize:20,
    color:'#25B36B',
    textAlign:'center',
    marginTop:2,
  },
   tablayout: {   
        flexDirection: 'row',  
        padding: 2,
        margin:2,marginTop:1
    },
    buttontab: {  
        margin: 5,
        width: (ScreenWidth-50)/4,
        height: 33,
        borderRadius: 5,
        alignItems: 'center',   
        justifyContent: 'center', 
    }, 
    nothave: {
      height: Platform.OS == 'ios' ? 84.5 : 65,
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: "center",
      paddingHorizontal: 20,
      borderRadius: 5,
      margin: 5,
  },  
  copytext: {
    fontSize: 16, 
    color: UColor.fontColor
   },
   nhaaout: {
    backgroundColor: '#4f617d',
  },
  wterout: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  tabbutton: {  
    alignItems: 'center',   
    justifyContent: 'center', 
  },   
  inptoutsource: {
      marginTop: 10,
      paddingHorizontal: 20,
      paddingBottom: 5,
      justifyContent: 'center',
      flexDirection: 'row',  
      alignItems: 'center',
  },
  outsource: {
      flexDirection: 'row',  
      alignItems: 'center',
  },
  inpt: {
    flex: 1, 
    color: UColor.arrow, 
    fontSize: 15, 
    height: 45, 
    paddingLeft: 10, 
  },

  inptTitle: {
    fontSize: 14, 
    color: UColor.fontColor, 
    lineHeight: 35,
    paddingHorizontal: 25,
    textAlign: "right"
  },
  inptTitlered: {
    fontSize: 14, 
    color: UColor.showy, 
    lineHeight: 35,
  },
    botnimg: {
      width: 86, 
      height: 38, 
      paddingHorizontal: 10,
      justifyContent: 'center', 
      alignItems: 'flex-end'
  },
    botn: {
      marginLeft: 10, 
      width: 80, 
      height: 38,  
      borderRadius: 3, 
      backgroundColor: UColor.tintColor, 
      justifyContent: 'center', 
      alignItems: 'center' 
  },
  botText: {
    fontSize: 17, 
    color: UColor.fontColor,
  },
     scanningimg: {
        width:30,
        height:30,
        justifyContent: 'center', 
        alignItems: 'center'
    }
});

export default Transaction;