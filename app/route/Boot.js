
import React from 'react';
import {Dimensions, Animated,View,StyleSheet,Text,Image} from 'react-native';
import NavigationUtil from '../utils/NavigationUtil';
import UImage from '../utils/Img'
import UColor from '../utils/Colors'
import Swiper from 'react-native-swiper';
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
import store from 'react-native-simple-store';

class Boot extends React.Component {
  
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
  }

  comin = () => {
    store.save("boot","1");
    NavigationUtil.reset(this.props.navigation, 'Home');
  }

  render() {
    return (
      <View style={styles.container}>
        <Swiper loop={false} activeDotColor="#2ACFFF">
            <View style={{justifyContent:'center',alignItems:'center',height:'100%'}}>
                <View style={{height:'30%',justifyContent:'center',alignItems:'center'}}>
                    <Text style={{color:"#fff",fontSize:24,textAlign:'center'}}>专属EOS的情报站</Text>
                    <Text style={{color:"#586888",fontSize:18,marginTop:30,textAlign:'center'}}>一线资讯，即时推送</Text>
                    <Text style={{color:"#586888",fontSize:18,textAlign:'center',marginTop:10}}>柚子百科，学富五车</Text>
                </View>
                <View style={{height:'50%',alignItems:'center'}}>
                    <Image source={UImage.a} style={{width:210,height:253,marginTop:50}} />
                </View>
            </View>
            <View style={{justifyContent:'center',alignItems:'center',height:'100%'}}>
                <View style={{height:'30%',justifyContent:'center',alignItems:'center'}}>
                    <Text style={{color:"#fff",fontSize:24,textAlign:'center'}}>世界的另一头，近在咫尺</Text>
                    <Text style={{color:"#586888",fontSize:18,marginTop:30,textAlign:'center'}}>海外资讯，一网打尽</Text>
                    <Text style={{color:"#586888",fontSize:18,textAlign:'center',marginTop:10}}>行情波动，及时掌控</Text>
                </View>
                <View style={{height:'50%',alignItems:'center'}}>
                    <Image source={UImage.b} style={{width:245,height:253,marginTop:50}} />
                </View>
            </View>
            <View style={{justifyContent:'center',alignItems:'center',height:'100%'}}>
                <View style={{height:'30%',justifyContent:'center',alignItems:'center'}}>
                    <Text style={{color:"#fff",fontSize:24,textAlign:'center'}}>您关心的EOS资讯</Text>
                    <Text style={{color:"#586888",fontSize:18,marginTop:30,textAlign:'center'}}>您最关心的EOS独家情报</Text>
                    <Text style={{color:"#586888",fontSize:18,textAlign:'center',marginTop:10}}>最新、最快、最全面</Text>
                </View>
                <View style={{height:'50%',alignItems:'center'}}>
                    <Image source={UImage.c} style={{width:215,height:253,marginTop:50}} />
                </View>
            </View>
            <View style={{justifyContent:'center',alignItems:'center',height:'100%'}}>
                <View style={{height:'30%',justifyContent:'center',alignItems:'center'}}>
                    <Text style={{color:"#fff",fontSize:24,textAlign:'center'}}>欢迎 EosToken</Text>
                    <Text style={{color:"#586888",fontSize:18,marginTop:30,textAlign:'center'}}>您的EOS情报站</Text>
                </View>
                <View style={{height:'50%',alignItems:'center'}}>
                    <Image source={UImage.d} style={{width:215,height:283,marginTop:50}} />
                </View>
                <Text onPress={()=>{this.comin()}} style={{color:"#2ACFFF",fontSize:22,width:100,textAlign:"center",position: 'absolute',left: width-100,right: 0,top: height-80,bottom: 0,}}>进入→</Text>
            </View>
        </Swiper>
      </View>
    );
  }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'column',
        backgroundColor: "#21232E",
    }
});  
export default Boot;