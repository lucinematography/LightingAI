import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Only test-local instrumentation exposes closure functions. No sender, network or native bridge runs.
export function verifyMosaicControls(fixtures,appSource=readFileSync(new URL('../app/src/main/assets/artnet-control.js',import.meta.url),'utf8')){
  const expectedIds=['aladdin-mosaic-2x4','aladdin-mosaic-4x4','aladdin-mosaic-3x6'];
  const modes=[['Simple CCT Crossfade RGBW',8],['Expert CCT Crossfade RGBW + Effects',11]];
  const source='https://aladdin-lights.com/wp-content/uploads/2023/06/ALADDIN_DMX_MAPS_ALL_FIXTURES-NEW.pdf';
  const effects=['Off','Strobe','Fade','Flicker','Flash','Police','Welding','Fire','Candle','Television','Dissolve'];
  const correctionByte=value=>value===0?0:value===-100?11:value<0?value+120:value===100?245:value+145;
  const correctionValue=value=>value<=10||value>=120&&value<=145?0:value<=20?-100:value<=119?value-120:value<=244?value-145:100;
  let linearChecks=0,correctionChecks=0,effectChecks=0,frameChecks=0,uiChecks=0,now=0;
  let patch=[];
  const sent=[],timers=new Map(),storage=new Map();
  let timerId=0;
  const elements={};
  const box={innerHTML:'',querySelectorAll(selector){
    const className=selector.slice(1),result=[];
    for(const match of this.innerHTML.matchAll(/<(?:input|select)\b([^>]*)>/g)){
      const attributes={};
      for(const attribute of match[1].matchAll(/([\w-]+)="([^"]*)"/g))attributes[attribute[1]]=attribute[2];
      if(attributes.class!==className)continue;
      result.push({dataset:{index:attributes['data-index'],suffix:attributes['data-suffix']},value:attributes.value||'0',listeners:{},addEventListener(name,fn){this.listeners[name]=fn;}});
    }
    this[className]=result;
    return result;
  }};
  elements.artnetVerifiedControls=box;
  const context={
    console,document:{getElementById:id=>elements[id]||null,querySelectorAll:()=>[],addEventListener(){}},
    localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
    setInterval:(fn,ms)=>{const id=++timerId;timers.set(id,{fn,ms});return id;},clearInterval:id=>timers.delete(id),setTimeout(){},clearTimeout(){},
    Date:{now:()=>now},
    catalogFixtures:fixtures,LightingAIDmxSnapshot:()=>({rows:patch}),addEventListener(){},
    LightingAIControlTransport:{isAvailable:()=>true,sendDmx:request=>{sent.push(request);return true;},sendSacnDmx:request=>{sent.push(request);return true;}}
  };
  context.window=context;
  assert.match(appSource,/\}\)\(\);\s*$/,'App closure boundary changed');
  const injected=appSource.replace(/\}\)\(\);\s*$/,'window.__mosaicTest={controlToDmx,controlFromDmx,writeControlToFrame,applyProfileRequirements,fadeChannelValue,fadeSnapChannels,sendVerifiedControl,renderVerifiedControls,patchSignature,fadeToScene,applyScene,frame,cloneFrames,armForTest:value=>{outputArmed=value;}};})();');
  runInNewContext(injected,context,{timeout:1000});
  const app=context.__mosaicTest;
  for(const id of expectedIds){
    const fixture=fixtures.find(item=>item.id===id);
    assert.ok(fixture,'Missing MOSAIC fixture '+id);
    assert.equal(fixture.dmxModes.length,2,id+' mode count');
    for(const [name,width] of modes){
      const matching=fixture.dmxModes.filter(mode=>mode.name===name);
      assert.equal(matching.length,1,id+' / '+name);
      const mode=matching[0];
      assert.equal(mode.channels,width);
      assert.equal(mode.verified,true);
      assert.equal(mode.sourceUrl,source);
      assert.equal(mode.controlScope,'full-profile');
      assert.deepEqual(mode.requiredChannels,[],'Direct controls must preserve selected correction and FX');
      assert.equal(mode.controls.length,width,'One explicit control per physical channel');
      assert.deepEqual(mode.controls.map(control=>control.channel),Array.from({length:width},(_,i)=>i+1));
      const linear=[['dimmer',1,0,100],['cct',2,2200,12000],['crossfade',4,0,100],['red',5,0,100],['green',6,0,100],['blue',7,0,100],['white',8,0,100],...(width===11?[['fxDimmer',10,0,100],['fxSpeed',11,0,100]]:[])];
      for(const [key,channel,min,max] of linear){
        const control=mode.controls.find(item=>item.key===key);
        assert.ok(control,key);
        assert.equal(control.channel,channel);
        assert.equal(control.type,key==='cct'?'cct-linear':'percent');
        assert.equal(control.bits,8);assert.equal(control.min,min);assert.equal(control.max,max);
        assert.equal(control.dmxMin,0);assert.equal(control.dmxMax,255);
        for(let byte=0;byte<=255;byte++){
          assert.equal(app.controlToDmx(control,min+(max-min)*byte/255),byte,key);
          linearChecks++;
        }
        assert.equal(app.controlToDmx(control,min-100),0);assert.equal(app.controlToDmx(control,max+100),255);
      }
      const correction=mode.controls[2];
      assert.equal(correction.key,'greenCorrection');assert.equal(correction.type,'piecewise');
      assert.equal(correction.bits,8);assert.equal(correction.min,-100);assert.equal(correction.max,100);
      assert.equal(correction.step,1);assert.equal(correction.defaultValue,0);assert.equal(correction.fade,'snap-at-end');
      for(let value=-100;value<=100;value++){
        assert.equal(app.controlToDmx(correction,value),correctionByte(value),'Signed correction '+value);
        correctionChecks++;
      }
      for(let byte=0;byte<=255;byte++)assert.equal(app.controlFromDmx(correction,byte),correctionValue(byte),'Read correction '+byte);
      for(const invalid of [-101,101,0.5,NaN,Infinity,null,undefined,'','wrong'])assert.equal(app.controlToDmx(correction,invalid),null);
      if(width===11){
        const effect=mode.controls[8];
        assert.equal(effect.key,'effect');assert.equal(effect.type,'enum');assert.equal(effect.bits,8);
        assert.equal(effect.defaultValue,0);assert.equal(effect.readFallback,0);assert.equal(effect.fade,'snap-at-end');
        assert.equal(effect.choices.length,11);
        effect.choices.forEach((choice,index)=>{
          assert.equal(choice.value,index);assert.equal(choice.dmxValue,index*10);
          assert.equal(choice.dmxMin,index*10);assert.equal(choice.dmxMax,index*10+9);assert.equal(choice.label,effects[index]);
          assert.equal(app.controlToDmx(effect,index),index*10);effectChecks++;
        });
        for(let byte=0;byte<=255;byte++)assert.equal(app.controlFromDmx(effect,byte),byte>=110?0:Math.floor(byte/10));
        for(const invalid of [-1,11,100,1.5,NaN,Infinity,null,undefined,'','wrong'])assert.equal(app.controlToDmx(effect,invalid),null);
      }
      patch=[{fixtureId:id,mode:name,universe:1,start:1,channels:width,flags:[]}];
      for(const start of [1,513-width]){
        patch[0].start=start;
        for(const control of mode.controls){
          const input=control.type==='enum'?7:control.type==='piecewise'?-100:control.max;
          const expected=control.type==='enum'?70:control.type==='piecewise'?11:255;
          const frame=new Array(512).fill(77),address=start+control.channel-1;
          assert.equal(app.applyProfileRequirements(frame,start,mode),true);
          assert.equal(app.writeControlToFrame(frame,address,control,input),true);
          assert.equal(frame[address-1],expected);
          assert.ok(frame.every((value,index)=>index===address-1||value===77),'Unrelated channel changed');
          frameChecks++;
        }
        const snap=app.fadeSnapChannels()['1'];
        assert.ok(snap.has(start+1));
        assert.equal(snap.has(start+7),width===11);
        assert.equal(snap.size,width===11?2:1);
      }
      patch[0].start=1;
      app.frame(1).fill(0);
      storage.set('lighting_language_v1','en');app.renderVerifiedControls(patch[0]);
      assert.match(box.innerHTML,/Green \/ magenta correction/);
      assert.equal((box.innerHTML.match(/artnet-verified-enum/g)||[]).length,width===11?1:0);
      assert.equal((box.innerHTML.match(/artnet-verified-range/g)||[]).length,width===11?10:8);
      for(const input of box['artnet-verified-range']){
        const control=mode.controls[Number(input.dataset.index)];
        input.value=String(control.max);
        app.armForTest(false);
        const count=sent.length,beforeFrame=JSON.stringify(app.cloneFrames());
        input.listeners.change.call(input);
        assert.equal(sent.length,count);assert.equal(JSON.stringify(app.cloneFrames()),beforeFrame,'Unarmed slider mutated frame');
        app.armForTest(true);input.listeners.change.call(input);
        assert.equal(sent.at(-1).channels[control.channel-1],app.controlToDmx(control,control.max),'Actual range handler '+control.key);
        uiChecks++;
      }
      if(width===11){
        assert.equal((box.innerHTML.match(/<option /g)||[]).length,11);
        app.armForTest(false);const before=sent.length,beforeFrame=JSON.stringify(app.cloneFrames());
        const select=box['artnet-verified-enum'][0];select.value='5';select.listeners.change.call(select);
        assert.equal(sent.length,before,'Unarmed UI must not send');
        assert.equal(JSON.stringify(app.cloneFrames()),beforeFrame,'Unarmed dropdown mutated frame');
        app.armForTest(true);select.listeners.change.call(select);
        assert.equal(sent.at(-1).channels[8],50,'Actual effect dropdown handler');uiChecks++;
      }
    }
  }
  // Exercise the actual frame sender, with a test-only transport and arm setter.
  const fixture=fixtures.find(item=>item.id===expectedIds[0]),profile=fixture.dmxModes[1];
  const row={fixtureId:fixture.id,mode:profile.name,universe:1,start:502,channels:11,flags:[]};patch=[row];
  const correction=profile.controls[2],effect=profile.controls[8];
  app.armForTest(true);app.frame(1).fill(77);
  const before=sent.length;
  for(const invalid of [11,-1,NaN,null])app.sendVerifiedControl(row,profile,effect,invalid);
  assert.equal(sent.length,before);assert.ok(app.frame(1).every(value=>value===77),'Invalid selection mutated frame');
  app.sendVerifiedControl(row,profile,correction,100);assert.equal(sent.at(-1).channels[503],245);
  app.sendVerifiedControl(row,profile,effect,7);assert.equal(sent.at(-1).channels[509],70);
  app.sendVerifiedControl(row,profile,profile.controls[0],50);
  assert.equal(sent.at(-1).channels[503],245);assert.equal(sent.at(-1).channels[509],70,'Dimmer must not reset effect');
  const count=sent.length;
  for(const bad of [{...row,start:503},{...row,channels:10},{...row,flags:['overlap']}])app.sendVerifiedControl(bad,profile,effect,1);
  app.sendVerifiedControl(row,{...profile},effect,1);
  assert.equal(sent.length,count,'Invalid/stale Patch or profile sent DMX');
  app.armForTest(false);app.sendVerifiedControl(row,profile,effect,0);assert.equal(sent.length,count);
  app.armForTest(true);
  // Fade must not select intervening effects or travel through correction dead bands.
  row.start=1;const initial=app.frame(1);initial.fill(0);initial[2]=11;initial[8]=10;
  const target=new Array(512).fill(255);target[2]=245;target[8]=70;
  storage.set('lighting_artnet_scenes_v1',JSON.stringify([{name:'Target',patchSignature:app.patchSignature(),frames:{'1':target}}]));
  now=0;app.fadeToScene(0,1);
  const tick=[...timers.values()].find(timer=>timer.ms===33).fn;
  for(const time of [0,10,100,500,990,999]){now=time;tick();assert.equal(sent.at(-1).channels[2],11);assert.equal(sent.at(-1).channels[8],10);}
  assert.equal(app.fadeChannelValue(0,255,0.5,false),128);
  now=1000;tick();assert.equal(sent.at(-1).channels[2],245);assert.equal(sent.at(-1).channels[8],70);
  app.renderVerifiedControls(row);assert.match(box.innerHTML,/<option value="7" selected>/);
  assert.match(box.innerHTML,/value="100"/,'Correction readback');
  // Existing 16-bit encoder remains coarse/fine, with no overrun of channel 512.
  const sixteen={type:'percent',bits:16,min:0,max:100,dmxMin:0,dmxMax:65535};
  const boundary=new Array(512).fill(77);
  assert.equal(app.writeControlToFrame(boundary,511,sixteen,100),true);
  assert.equal(boundary[510],255);assert.equal(boundary[511],255);
  assert.equal(app.writeControlToFrame(boundary,512,sixteen,0),false);assert.equal(boundary[511],255);
  return {linearChecks,correctionChecks,effectChecks,frameChecks,uiChecks,transport:'test-only',ok:true};
}
