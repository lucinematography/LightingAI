function list(v){return Array.isArray(v)?v.map(String):[]}

export function wirelessTransportFlags(fixture){
  const c=fixture?.control;
  const values=Array.isArray(c)?list(c):[...list(c?.wireless),...list(c?.directLightingAI)];
  return {
    bluetooth:values.some(v=>/(^|[^a-z0-9])(bluetooth|ble)([^a-z0-9]|$)/i.test(v)),
    wifi:values.some(v=>/(^|[^a-z0-9])(wi-?fi|wifi|wlan)([^a-z0-9]|$)/i.test(v))
  };
}

export function wirelessRouteKind(fixture,transport){
  const c=fixture?.control;
  if(!c||Array.isArray(c)||typeof c!=='object') return 'direct';
  const rows=list(c?.externalInterfaceRequired).map(v=>v.toLowerCase());
  if(transport==='wifi'){
    return rows.some(v=>/wi-?fi|wifi|w-2|wireless adapter/.test(v))?'assisted':'direct';
  }
  if(transport==='bluetooth'){
    return rows.some(v=>/bluetooth|\bble\b|bt dongle|bluetooth.*dongle|sidus link bridge/.test(v))?'assisted':'direct';
  }
  return 'direct';
}
