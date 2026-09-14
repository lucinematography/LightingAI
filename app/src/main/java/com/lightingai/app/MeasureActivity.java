package com.lightingai.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Matrix;
import android.graphics.SurfaceTexture;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.hardware.camera2.CameraCaptureSession;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraDevice;
import android.hardware.camera2.CameraManager;
import android.hardware.camera2.CaptureRequest;
import android.hardware.camera2.params.StreamConfigurationMap;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Size;
import android.view.Gravity;
import android.view.Surface;
import android.view.TextureView;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.util.Arrays;
import java.util.Locale;

public class MeasureActivity extends Activity implements SensorEventListener {
    private static final int CAMERA_PERMISSION = 701;
    private TextureView textureView;
    private CameraDevice cameraDevice;
    private CameraCaptureSession captureSession;
    private CaptureRequest.Builder previewBuilder;
    private HandlerThread cameraThread;
    private Handler cameraHandler;
    private Size previewSize;
    private SensorManager sensorManager;
    private Sensor rotationSensor;
    private TextView distanceText;
    private TextView angleText;
    private TextView hintText;
    private EditText heightInput;
    private double depressionDeg = Double.NaN;
    private double distanceM = Double.NaN;
    private double cameraHeightM = 1.50;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(13,15,18));
        getWindow().setNavigationBarColor(Color.rgb(13,15,18));
        cameraHeightM = getIntent().getDoubleExtra("cameraHeight", 1.50);
        buildUi();
        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (rotationSensor == null) rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_GAME_ROTATION_VECTOR);
    }

    private TextView text(String value, float sp, int color) {
        TextView v = new TextView(this);
        v.setText(value); v.setTextSize(sp); v.setTextColor(color);
        return v;
    }

    private Button button(String label) {
        Button b = new Button(this);
        b.setText(label); b.setTextColor(Color.WHITE); b.setTextSize(15); b.setAllCaps(false);
        b.setBackgroundColor(Color.rgb(37,42,49));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(0, dp(52), 1f);
        lp.setMargins(dp(4),dp(4),dp(4),dp(4)); b.setLayoutParams(lp);
        return b;
    }

    private void buildUi() {
        FrameLayout root = new FrameLayout(this); root.setBackgroundColor(Color.BLACK);
        textureView = new TextureView(this); root.addView(textureView, new FrameLayout.LayoutParams(-1,-1));
        textureView.setSurfaceTextureListener(surfaceListener);

        TextView shade = new TextView(this); shade.setBackgroundColor(0x77000000);
        FrameLayout.LayoutParams shadeLp = new FrameLayout.LayoutParams(-1, dp(126), Gravity.TOP); root.addView(shade, shadeLp);

        LinearLayout top = new LinearLayout(this); top.setOrientation(LinearLayout.VERTICAL); top.setPadding(dp(18),dp(12),dp(18),dp(10));
        TextView title = text("MERENJE SCENE",22,Color.WHITE); title.setTypeface(null,1); top.addView(title);
        distanceText = text("— m",36,Color.rgb(245,197,66)); distanceText.setTypeface(null,1); top.addView(distanceText);
        angleText = text("Ciljaj podnožje objekta",13,0xffc5c9d0); top.addView(angleText);
        root.addView(top,new FrameLayout.LayoutParams(-1,dp(126),Gravity.TOP));

        TextView cross = text("+",52,Color.rgb(245,197,66)); cross.setGravity(Gravity.CENTER); cross.setShadowLayer(5,0,0,Color.BLACK);
        FrameLayout.LayoutParams crossLp = new FrameLayout.LayoutParams(dp(84),dp(84),Gravity.CENTER); root.addView(cross,crossLp);

        LinearLayout panel = new LinearLayout(this); panel.setOrientation(LinearLayout.VERTICAL); panel.setPadding(dp(14),dp(10),dp(14),dp(14)); panel.setBackgroundColor(0xdd0d0f12);
        hintText = text("Nišan postavi tačno na mesto gde objekat dodiruje pod. Drži telefon mirno.",12,0xffb0b5bd); panel.addView(hintText);
        LinearLayout hrow = new LinearLayout(this); hrow.setGravity(Gravity.CENTER_VERTICAL);
        TextView hl = text("Visina kamere (m)",14,Color.WHITE); hrow.addView(hl,new LinearLayout.LayoutParams(0,dp(48),1f));
        heightInput = new EditText(this); heightInput.setSingleLine(true); heightInput.setText(String.format(Locale.US,"%.2f",cameraHeightM)); heightInput.setTextColor(Color.WHITE); heightInput.setTextSize(16); heightInput.setInputType(2|8192); heightInput.setGravity(Gravity.CENTER); heightInput.setBackgroundColor(0xff20242a);
        hrow.addView(heightInput,new LinearLayout.LayoutParams(dp(110),dp(44))); panel.addView(hrow);
        LinearLayout row = new LinearLayout(this); row.setOrientation(LinearLayout.HORIZONTAL);
        Button actor = button("GLUMAC"); Button wall = button("ZID"); Button background = button("POZADINA");
        actor.setOnClickListener(v->finishMeasurement("actor")); wall.setOnClickListener(v->finishMeasurement("wall")); background.setOnClickListener(v->finishMeasurement("background"));
        row.addView(actor); row.addView(wall); row.addView(background); panel.addView(row);
        Button cancel = button("Nazad bez čuvanja"); cancel.setOnClickListener(v->{setResult(RESULT_CANCELED);finish();});
        LinearLayout crow = new LinearLayout(this); crow.addView(cancel); panel.addView(crow);
        FrameLayout.LayoutParams panelLp = new FrameLayout.LayoutParams(-1,dp(198),Gravity.BOTTOM); root.addView(panel,panelLp);
        setContentView(root);
    }

    private int dp(int v){return Math.round(v*getResources().getDisplayMetrics().density);}

    private final TextureView.SurfaceTextureListener surfaceListener = new TextureView.SurfaceTextureListener() {
        @Override public void onSurfaceTextureAvailable(SurfaceTexture s,int w,int h){openCamera();}
        @Override public void onSurfaceTextureSizeChanged(SurfaceTexture s,int w,int h){configureTransform(w,h);}
        @Override public boolean onSurfaceTextureDestroyed(SurfaceTexture s){return true;}
        @Override public void onSurfaceTextureUpdated(SurfaceTexture s){}
    };

    @Override protected void onResume(){super.onResume();startCameraThread();if(rotationSensor!=null)sensorManager.registerListener(this,rotationSensor,SensorManager.SENSOR_DELAY_UI);if(textureView!=null&&textureView.isAvailable())openCamera();}
    @Override protected void onPause(){closeCamera();stopCameraThread();if(sensorManager!=null)sensorManager.unregisterListener(this);super.onPause();}

    private void startCameraThread(){if(cameraThread!=null)return;cameraThread=new HandlerThread("LightingAIMeasureCamera");cameraThread.start();cameraHandler=new Handler(cameraThread.getLooper());}
    private void stopCameraThread(){if(cameraThread==null)return;cameraThread.quitSafely();try{cameraThread.join();}catch(InterruptedException ignored){}cameraThread=null;cameraHandler=null;}

    private void openCamera(){
        if(checkSelfPermission(Manifest.permission.CAMERA)!=PackageManager.PERMISSION_GRANTED){requestPermissions(new String[]{Manifest.permission.CAMERA},CAMERA_PERMISSION);return;}
        try{
            CameraManager manager=(CameraManager)getSystemService(CAMERA_SERVICE);String chosen=null;
            for(String id:manager.getCameraIdList()){Integer facing=manager.getCameraCharacteristics(id).get(CameraCharacteristics.LENS_FACING);if(facing!=null&&facing==CameraCharacteristics.LENS_FACING_BACK){chosen=id;break;}}
            if(chosen==null)return;CameraCharacteristics cc=manager.getCameraCharacteristics(chosen);StreamConfigurationMap map=cc.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP);if(map==null)return;
            previewSize=chooseSize(map.getOutputSizes(SurfaceTexture.class));manager.openCamera(chosen,cameraCallback,cameraHandler);
        }catch(Exception e){hintText.setText("Kamera nije dostupna: "+e.getClass().getSimpleName());}
    }

    private Size chooseSize(Size[] sizes){Size best=sizes[0];for(Size s:sizes){long p=(long)s.getWidth()*s.getHeight();long bp=(long)best.getWidth()*best.getHeight();if(p<=1920L*1080L&&p>bp)best=s;}return best;}

    private final CameraDevice.StateCallback cameraCallback=new CameraDevice.StateCallback(){
        @Override public void onOpened(CameraDevice c){cameraDevice=c;createPreview();}
        @Override public void onDisconnected(CameraDevice c){c.close();cameraDevice=null;}
        @Override public void onError(CameraDevice c,int error){c.close();cameraDevice=null;}
    };

    private void createPreview(){
        try{SurfaceTexture st=textureView.getSurfaceTexture();if(st==null||cameraDevice==null||previewSize==null)return;st.setDefaultBufferSize(previewSize.getWidth(),previewSize.getHeight());Surface surface=new Surface(st);previewBuilder=cameraDevice.createCaptureRequest(CameraDevice.TEMPLATE_PREVIEW);previewBuilder.addTarget(surface);previewBuilder.set(CaptureRequest.CONTROL_AF_MODE,CaptureRequest.CONTROL_AF_MODE_CONTINUOUS_PICTURE);cameraDevice.createCaptureSession(Arrays.asList(surface),new CameraCaptureSession.StateCallback(){@Override public void onConfigured(CameraCaptureSession s){captureSession=s;try{s.setRepeatingRequest(previewBuilder.build(),null,cameraHandler);}catch(Exception ignored){}configureTransform(textureView.getWidth(),textureView.getHeight());}@Override public void onConfigureFailed(CameraCaptureSession s){}},cameraHandler);}catch(Exception e){hintText.setText("Pregled kamere nije dostupan.");}
    }

    private void configureTransform(int vw,int vh){if(previewSize==null||textureView==null)return;int rotation=getWindowManager().getDefaultDisplay().getRotation();Matrix m=new Matrix();float cx=vw/2f,cy=vh/2f;if(rotation==Surface.ROTATION_0)m.postRotate(90,cx,cy);else if(rotation==Surface.ROTATION_180)m.postRotate(270,cx,cy);textureView.setTransform(m);}
    private void closeCamera(){if(captureSession!=null){captureSession.close();captureSession=null;}if(cameraDevice!=null){cameraDevice.close();cameraDevice=null;}}

    @Override public void onSensorChanged(SensorEvent event){
        if(event.sensor.getType()!=Sensor.TYPE_ROTATION_VECTOR&&event.sensor.getType()!=Sensor.TYPE_GAME_ROTATION_VECTOR)return;
        float[] r=new float[9];SensorManager.getRotationMatrixFromVector(r,event.values);
        double wx=-r[2],wy=-r[5],wz=-r[8];double horizontal=Math.sqrt(wx*wx+wy*wy);depressionDeg=Math.toDegrees(Math.atan2(-wz,horizontal));
        cameraHeightM=parseHeight();
        if(depressionDeg>2.5&&depressionDeg<82&&cameraHeightM>0.2){distanceM=cameraHeightM/Math.tan(Math.toRadians(depressionDeg));if(distanceM>0&&distanceM<100){distanceText.setText(String.format(Locale.US,"%.2f m",distanceM));angleText.setText(String.format(Locale.US,"Nagib %.1f° nadole • ciljaj podnožje",depressionDeg));return;}}
        distanceM=Double.NaN;distanceText.setText("— m");angleText.setText(depressionDeg<=2.5?"Spusti nišan ka podnožju objekta":"Podesi visinu kamere i ciljaj podnožje");
    }
    @Override public void onAccuracyChanged(Sensor sensor,int accuracy){}

    private double parseHeight(){try{return Double.parseDouble(heightInput.getText().toString().trim().replace(',','.'));}catch(Exception e){return 1.50;}}
    private void finishMeasurement(String target){if(!Double.isFinite(distanceM)){hintText.setText("Nema stabilnog merenja. Spusti nišan na podnožje objekta.");return;}Intent data=new Intent();data.putExtra("target",target);data.putExtra("distance",distanceM);data.putExtra("angle",depressionDeg);data.putExtra("cameraHeight",parseHeight());setResult(RESULT_OK,data);finish();}

    @Override public void onRequestPermissionsResult(int requestCode,String[] permissions,int[] grantResults){super.onRequestPermissionsResult(requestCode,permissions,grantResults);if(requestCode==CAMERA_PERMISSION&&grantResults.length>0&&grantResults[0]==PackageManager.PERMISSION_GRANTED)openCamera();else if(requestCode==CAMERA_PERMISSION){hintText.setText("Dozvoli kameru da bi merenje radilo.");}}
}
