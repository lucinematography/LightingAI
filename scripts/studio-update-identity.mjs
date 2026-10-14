// Public metadata preflight, performed after Android SDK apksigner verification.
// This module does not verify signatures, sign, install, migrate or read private keys.
export const STUDIO_APPLICATION_ID='com.lightingai.app.studio';
export function validateStudioIdentity(value){
  if(!value||value.applicationId!==STUDIO_APPLICATION_ID||value.debuggable!==false||
     !Number.isInteger(value.versionCode)||value.versionCode<1||value.versionCode>2100000000||
     !/^[a-f0-9]{64}$/.test(value.certificateSha256||'')||
     !/^[a-f0-9]{64}$/.test(value.apkSha256||''))
    throw new Error('Invalid public Studio APK identity.');
  return Object.freeze({applicationId:value.applicationId,debuggable:false,
    versionCode:value.versionCode,certificateSha256:value.certificateSha256,apkSha256:value.apkSha256});
}
export function validateStudioUpdate(previous,current){
  const before=validateStudioIdentity(previous),after=validateStudioIdentity(current);
  if(before.certificateSha256!==after.certificateSha256)
    throw new Error('Signing certificate changed; update is blocked.');
  if(after.versionCode<=before.versionCode)
    throw new Error('versionCode must increase; update is blocked.');
  return Object.freeze({status:'PUBLIC_METADATA_COMPATIBLE',
    applicationId:STUDIO_APPLICATION_ID,previousVersionCode:before.versionCode,
    versionCode:after.versionCode,certificateSha256:after.certificateSha256,
    limitation:'Requires apksigner verification of both original APKs; no installation performed.'});
}
