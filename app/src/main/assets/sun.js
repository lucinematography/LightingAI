/* LightingAI SUNCE module - isolated solar calculations.
 * No network dependency. Azimuth: 0=N, 90=E, 180=S, 270=W.
 */
(function(global){
  'use strict';
  const RAD=Math.PI/180, DEG=180/Math.PI;
  const norm=a=>(a%360+360)%360;
  const jd=d=>d.getTime()/86400000+2440587.5;
  function position(date,lat,lon){
    const J=jd(date), n=J-2451545.0;
    const L=norm(280.460+0.9856474*n);
    const g=norm(357.528+0.9856003*n)*RAD;
    const lambda=norm(L+1.915*Math.sin(g)+0.020*Math.sin(2*g))*RAD;
    const eps=(23.439-0.0000004*n)*RAD;
    const ra=Math.atan2(Math.cos(eps)*Math.sin(lambda),Math.cos(lambda));
    const dec=Math.asin(Math.sin(eps)*Math.sin(lambda));
    const gmst=norm(280.46061837+360.98564736629*(J-2451545.0));
    const H=norm(gmst+lon-ra*DEG)*RAD;
    const phi=lat*RAD;
    const alt=Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H));
    const az=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(phi)-Math.tan(dec)*Math.cos(phi));
    return {azimuth:norm(az*DEG+180),elevation:alt*DEG};
  }
  function dayPath(date,lat,lon,stepMinutes){
    const step=Math.max(5,Number(stepMinutes)||30), out=[];
    const d=new Date(date); d.setHours(0,0,0,0);
    for(let m=0;m<1440;m+=step){const t=new Date(d.getTime()+m*60000),p=position(t,lat,lon);out.push({time:t,azimuth:p.azimuth,elevation:p.elevation});}
    return out;
  }
  function crossings(date,lat,lon){
    const pts=dayPath(date,lat,lon,5), threshold=-0.833;
    let rise=null,set=null;
    for(let i=1;i<pts.length;i++){
      if(!rise&&pts[i-1].elevation<threshold&&pts[i].elevation>=threshold)rise=pts[i].time;
      if(!set&&pts[i-1].elevation>=threshold&&pts[i].elevation<threshold)set=pts[i].time;
    }
    return {sunrise:rise,sunset:set};
  }
  global.LightingAISun={position,dayPath,crossings};
})(window);
