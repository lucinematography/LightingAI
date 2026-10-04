import { wirelessTransportFlags, wirelessRouteKind } from './wireless-route-classification.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

const directBluetooth={
  id:'synthetic-direct-bluetooth',
  control:{wireless:['Bluetooth/App'],externalInterfaceRequired:[]}
};
expect(wirelessTransportFlags(directBluetooth).bluetooth===true,'direct Bluetooth fixture not detected');
expect(wirelessRouteKind(directBluetooth,'bluetooth')==='direct','direct Bluetooth fixture misclassified as assisted');

const arriDongle={
  id:'synthetic-arri-dongle',
  control:{
    wireless:['ARRI LiCo Bluetooth 5.0 via supported USB dongle'],
    externalInterfaceRequired:['Supported Bluetooth 5.0 USB dongle']
  }
};
expect(wirelessTransportFlags(arriDongle).bluetooth===true,'ARRI Bluetooth fixture not detected');
expect(wirelessRouteKind(arriDongle,'bluetooth')==='assisted','ARRI Bluetooth dongle route must be assisted');

const nanliteW2={
  id:'synthetic-nanlite-w2',
  control:{
    wireless:['Wi-Fi via Nanlite W-2 adapter'],
    externalInterfaceRequired:['Nanlite W-2 Wi-Fi adapter']
  }
};
expect(wirelessTransportFlags(nanliteW2).wifi===true,'Nanlite W-2 Wi-Fi fixture not detected');
expect(wirelessRouteKind(nanliteW2,'wifi')==='assisted','Nanlite W-2 Wi-Fi route must be assisted');

const directWifi={
  id:'synthetic-direct-wifi',
  control:{wireless:['Wi-Fi'],externalInterfaceRequired:[]}
};
expect(wirelessRouteKind(directWifi,'wifi')==='direct','built-in Wi-Fi fixture misclassified as assisted');

console.log(JSON.stringify({ok:failures.length===0,failures},null,2));
if(failures.length)process.exit(1);
