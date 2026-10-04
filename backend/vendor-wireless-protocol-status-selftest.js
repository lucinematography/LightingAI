import { VENDOR_WIRELESS_PROTOCOL_STATUS } from './vendor-wireless-protocol-status.js';

const failures=[];
const expect=(ok,msg)=>{if(!ok)failures.push(msg)};

const expected=['Aputure','Godox','Nanlite','ARRI','Astera','Aladdin','EV Light','Kino Flo','De Sisti','LiteGear'];
for(const maker of expected) expect(!!VENDOR_WIRELESS_PROTOCOL_STATUS[maker],maker+' protocol status missing');

for(const maker of ['Aputure','Godox','Nanlite','ARRI','Astera','Aladdin','EV Light']){
  const row=VENDOR_WIRELESS_PROTOCOL_STATUS[maker];
  expect(row.commandSpec!=='production_verified',maker+' proprietary command path must not be marked production verified');
}

expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Astera.nextStep==='official-app-btsnoop-capture-and-replay-verification','Astera physical evidence path changed');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Godox.capturePlanId==='godox-light-bluetooth-capture-v1','Godox capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Nanlite.capturePlanId==='nanlink-direct-bluetooth-capture-v1','Nanlite capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.Aputure.capturePlanId==='sidus-direct-bluetooth-capture-v1','Aputure capture plan link missing');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Kino Flo'].bluetooth==='not_verified_for_current_catalog','Kino Flo Bluetooth must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['Kino Flo'].wifi==='not_verified_for_current_catalog','Kino Flo Wi-Fi must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS['De Sisti'].bluetooth==='not_verified_for_current_catalog','De Sisti Bluetooth must remain unverified');
expect(VENDOR_WIRELESS_PROTOCOL_STATUS.LiteGear.bluetooth==='not_verified_for_current_catalog','LiteGear Bluetooth must remain unverified');

console.log(JSON.stringify({
  ok:failures.length===0,
  manufacturers:expected.length,
  commandProductionVerified:0,
  failures
},null,2));
if(failures.length)process.exit(1);
