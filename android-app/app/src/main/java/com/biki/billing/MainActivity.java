package com.biki.billing;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.*;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.*;
import android.print.PrintManager;
import android.view.*;
import android.webkit.*;
import android.widget.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;
import android.hardware.biometrics.BiometricPrompt;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import android.util.Base64;

public class MainActivity extends Activity {
    private static final String HOME = "https://bikionlineservicecenter.github.io/";
    private static final int PICK = 44;
    private WebView web;
    private FrameLayout signatureRoot;
    private View signatureLogin;
    private TextView signatureMessage;
    private boolean signatureAuthorized=false,signatureAttempt=false,signatureReady=false,signatureShowingPassword=false;
    private int signatureGeneration=0;
    private final android.os.Handler signatureHandler=new android.os.Handler(android.os.Looper.getMainLooper());
    private static final int NIGHT=0xff071322, PANEL=0xff102139, GOLD=0xffeac16a, PALE=0xfff5f7fb, SOFT=0xffa7b8ce;

    private ProgressBar progress;
    private ValueCallback<Uri[]> files;
    private String retryUrl = HOME;
    private boolean failed = false;
    private boolean biometricBusy=false;
    private static final String BIO_KEY="biki_biometric_v1";
    private static final String BIO_PREF="biki_biometric_private";
    private int dp(int v) { return (int)(v * getResources().getDisplayMetrics().density + .5f); }
    private boolean inside(Uri u) {
        return "https".equalsIgnoreCase(u.getScheme()) && "bikionlineservicecenter.github.io".equalsIgnoreCase(u.getHost());
    }
    private void external(Uri u) {
        String s = u.getScheme();
        if ("https".equalsIgnoreCase(s) || "http".equalsIgnoreCase(s) || "mailto".equalsIgnoreCase(s)
            || "tel".equalsIgnoreCase(s) || "whatsapp".equalsIgnoreCase(s) || "tg".equalsIgnoreCase(s) || "upi".equalsIgnoreCase(s)) {
            try { startActivity(new Intent(Intent.ACTION_VIEW, u)); }
            catch (Exception e) { Toast.makeText(this,"No app available for this link",Toast.LENGTH_SHORT).show(); }
        }
    }
    private void item(LinearLayout bar, String caption, String desc, Runnable action) {
        Button b = new Button(this);
        b.setText(caption); b.setTextColor(Color.WHITE); b.setTextSize(14); b.setAllCaps(false);
        b.setContentDescription(desc); b.setMinWidth(0); b.setMinimumWidth(0); b.setPadding(dp(8),0,dp(8),0);
        b.setBackgroundColor(Color.TRANSPARENT);
        b.setOnClickListener(v -> action.run());
        bar.addView(b,new LinearLayout.LayoutParams(-2,dp(48)));
    }
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        try { startApp(state); } catch(RuntimeException e) { android.util.Log.e("BIKI", "Startup failed",e); showStartupError(e); }
    }
    private void startApp(Bundle state) {
        // Let Android fit system bars once; no early insets controller access.
        getWindow().setStatusBarColor(NIGHT);
        getWindow().setNavigationBarColor(NIGHT);
        int flags=0;
        // Dark system bar backgrounds require light system icons.
        getWindow().getDecorView().setSystemUiVisibility(flags);
        FrameLayout root=new FrameLayout(this);
        root.setBackgroundColor(NIGHT); signatureRoot=root;
        web=new WebView(this);web.setBackgroundColor(NIGHT);web.setVisibility(View.INVISIBLE);
        root.addView(web,new FrameLayout.LayoutParams(-1,-1));
        progress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
        root.addView(progress,new FrameLayout.LayoutParams(-1,dp(2),Gravity.TOP));
        setContentView(root);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        showSignatureLogin(false);
        if(Build.VERSION.SDK_INT>=30){
            WindowInsetsController controller=getWindow().getInsetsController();
            if(controller!=null)controller.setSystemBarsAppearance(0,WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS|WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
        }
        if(Build.VERSION.SDK_INT>=35){
            root.setOnApplyWindowInsetsListener((v,insets)->{
                android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout());
                v.setPadding(bars.left,bars.top,bars.right,bars.bottom);
                return insets;
            });
            root.requestApplyInsets();
        }
        WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false); s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setSupportMultipleWindows(false); s.setJavaScriptCanOpenWindowsAutomatically(false);
        s.setUseWideViewPort(true); s.setLoadWithOverviewMode(false); s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r){
                if (!r.isForMainFrame()) return false;
                if(nativeAction(r.getUrl()))return true; if (inside(r.getUrl())) return false; external(r.getUrl()); return true;
            }
            @Override public boolean shouldOverrideUrlLoading(WebView v,String url){
                Uri u=Uri.parse(url); if(nativeAction(u))return true; if(inside(u)) return false; external(u); return true;
            }
            @Override public void onPageStarted(WebView v,String url,android.graphics.Bitmap icon){
                if(inside(Uri.parse(url))) {retryUrl=url; failed=false;} signatureReady=false;signatureAuthorized=false;signatureAttempt=false;signatureGeneration++;v.setVisibility(View.INVISIBLE);showSignatureLogin(false);progress.setVisibility(View.VISIBLE);
            }
            @Override public void onPageCommitVisible(WebView v,String url){ /* Wait for billing route before revealing WebView. */ }
            @Override public void onPageFinished(WebView v,String url){if(inside(Uri.parse(url)))injectV2();}
            @Override public void onReceivedError(WebView v,WebResourceRequest r,WebResourceError e){
                if(r.isForMainFrame()) { v.setVisibility(View.INVISIBLE); signatureReady=false;signatureAuthorized=false;signatureAttempt=false;showSignatureLogin(false);failed=true; new AlertDialog.Builder(MainActivity.this).setTitle("Connection problem").setMessage("Check your internet connection and try again.").setPositiveButton("Retry",(d,w)->v.loadUrl(retryUrl)).setNegativeButton("Close",null).show(); }
            }
            @Override public boolean onRenderProcessGone(WebView v,RenderProcessGoneDetail detail){
                if(Build.VERSION.SDK_INT>=26){
                    android.util.Log.e("BIKI","WebView renderer stopped; crashed="+detail.didCrash());
                    if(v.getParent() instanceof android.view.ViewGroup)((android.view.ViewGroup)v.getParent()).removeView(v);
                    v.destroy();web=null;
                    showStartupError(new IllegalStateException("WebView renderer stopped"));return true;
                }
                return false;
            }
            @Override public void onReceivedSslError(WebView v,SslErrorHandler h,SslError e){
                h.cancel();v.setVisibility(View.INVISIBLE);signatureAuthorized=false;signatureReady=false;showSignatureLogin(false); Toast.makeText(MainActivity.this,"Secure connection failed",Toast.LENGTH_LONG).show();
            }
        });
        web.setWebChromeClient(new WebChromeClient(){
            @Override public void onProgressChanged(WebView v,int n){progress.setProgress(n); progress.setVisibility(n==100?View.GONE:View.VISIBLE);}
            @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> cb,FileChooserParams p){
                if(files!=null) files.onReceiveValue(null); files=cb;
                try { startActivityForResult(p.createIntent(),PICK); } catch(Exception e){files.onReceiveValue(null); files=null; return false;}
                return true;
            }
        });
        web.setDownloadListener((url,ua,cd,mime,len)->{
            Uri u=Uri.parse(url);
            if(!"https".equalsIgnoreCase(u.getScheme())){
                Toast.makeText(this,"For this file, use More > Open in browser",Toast.LENGTH_LONG).show(); return;
            }
            try {
                DownloadManager.Request req=new DownloadManager.Request(u);
                String name=URLUtil.guessFileName(url,cd,mime);
                req.setTitle(name); if(mime!=null) req.setMimeType(mime);
                if(ua!=null) req.addRequestHeader("User-Agent",ua);
                String cookie=CookieManager.getInstance().getCookie(url); if(cookie!=null) req.addRequestHeader("Cookie",cookie);
                req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                if(Build.VERSION.SDK_INT>=29) req.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS,name);
                ((DownloadManager)getSystemService(DOWNLOAD_SERVICE)).enqueue(req);
                Toast.makeText(this,"Download started",Toast.LENGTH_SHORT).show();
            }catch(Exception e){Toast.makeText(this,"Download failed. Try Chrome.",Toast.LENGTH_LONG).show();}
        });
        web.loadUrl(HOME);signatureHandler.postDelayed(signatureWatch,500);
    }
    private void showStartupError(RuntimeException e){
        LinearLayout panel=new LinearLayout(this);panel.setOrientation(LinearLayout.VERTICAL);panel.setGravity(Gravity.CENTER);panel.setPadding(dp(24),dp(24),dp(24),dp(24));panel.setBackgroundColor(0xFFF1F5FA);
        TextView title=new TextView(this);title.setText("BIKI Billing PRO");title.setTextColor(NIGHT);title.setTextSize(24);panel.addView(title);
        TextView message=new TextView(this);message.setText("App startup could not complete. Update Android System WebView and try again.\n"+e.getClass().getSimpleName());message.setPadding(0,dp(16),0,dp(16));panel.addView(message);
        Button retry=new Button(this);retry.setText("Retry");retry.setOnClickListener(v->recreate());panel.addView(retry);
        Button browser=new Button(this);browser.setText("Open website");browser.setOnClickListener(v->external(Uri.parse(HOME)));panel.addView(browser);
        setContentView(panel);
    }
    private void injectV2(){
        try(InputStream in=getAssets().open("native-v2.js");ByteArrayOutputStream out=new ByteArrayOutputStream()){
            byte[] buffer=new byte[8192];int n;while((n=in.read(buffer))!=-1)out.write(buffer,0,n);
            String guard="(function(){sessionStorage.setItem('biki_view_v1','billing');var s=document.createElement('style');s.textContent='#bikiPublicHome,#bikiPublicBack{display:none!important}';document.head.appendChild(s);function route(){var h=document.getElementById('bikiPublicHome');if(typeof window.bikiPublicOpenBilling==='function')window.bikiPublicOpenBilling();if(h)h.hidden=true;}route();window.bikiPublicShowHome=route;var h=document.getElementById('bikiPublicHome');if(h)new MutationObserver(function(){if(!h.hidden)route();}).observe(h,{attributes:true,attributeFilter:['hidden']});return !!h&&h.hidden;})()";
            web.evaluateJavascript(guard,ready->{if(!"true".equals(ready)){signatureStatus("Billing login unavailable. Tap Retry.");return;}web.evaluateJavascript(new String(out.toByteArray(),StandardCharsets.UTF_8),result->{signatureReady=true;refreshBioUi();if(!signatureAuthorized)signatureStatus("");});});
        }catch(IOException e){Toast.makeText(this,"App theme could not load",Toast.LENGTH_SHORT).show();}
    }
    private boolean nativeAction(Uri u){
        if(!"bikiapp".equals(u.getScheme()))return false;
        if(web.getUrl()==null||!inside(Uri.parse(web.getUrl())))return true;
        String action=u.getHost();
        if("reload".equals(action)){if(failed)web.loadUrl(retryUrl);else web.reload();}
        else if("browser".equals(action))external(Uri.parse(HOME));
        else if("biometric-settings".equals(action))biometricSettings();
        else if("biometric-login".equals(action))biometricLogin();
        else if("print".equals(action)){PrintManager pm=(PrintManager)getSystemService(PRINT_SERVICE);pm.print("BIKI Billing",web.createPrintDocumentAdapter("BIKI Billing"),null);}
        return true;
    }

    private boolean safePage(){return web!=null&&web.getUrl()!=null&&inside(Uri.parse(web.getUrl()))&&!isFinishing();}
    private SharedPreferences bioPrefs(){return getSharedPreferences(BIO_PREF,MODE_PRIVATE);}
    private boolean bioEnabled(){return bioPrefs().contains("cipher")&&bioPrefs().contains("iv");}
    private void bioMessage(String message){Toast.makeText(this,message,Toast.LENGTH_LONG).show();}
    private void refreshBioUi(){
        if(safePage())web.evaluateJavascript("if(window.__bikiBiometricStatus)window.__bikiBiometricStatus("+bioEnabled()+","+(Build.VERSION.SDK_INT>=28)+")",null);
    }
    private void eraseBio(){
        bioPrefs().edit().clear().apply();
        try{KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);ks.deleteEntry(BIO_KEY);}catch(Exception ignored){}
        refreshBioUi();
    }
    private android.graphics.drawable.GradientDrawable securityShape(int color,int radius,int border){
        android.graphics.drawable.GradientDrawable bg=new android.graphics.drawable.GradientDrawable();
        bg.setColor(color);bg.setCornerRadius(dp(radius));if(border!=0)bg.setStroke(dp(1),border);return bg;
    }
    private TextView securityText(String value,int size,int color,boolean bold){
        TextView t=new TextView(this);t.setText(value);t.setTextSize(size);t.setTextColor(color);
        if(bold)t.setTypeface(android.graphics.Typeface.DEFAULT,android.graphics.Typeface.BOLD);return t;
    }
    private void biometricSettings(){
        if(Build.VERSION.SDK_INT<28){bioMessage("Fingerprint login requires Android 9 or later.");return;}
        if(!safePage())return;
        web.evaluateJavascript("(function(){try{return sessionStorage.getItem('biki_logged_in')==='yes' && !!firebase.auth().currentUser && document.getElementById('bikiCloudGate').style.display==='none';}catch(e){return false;}})()",result->{
            if(!"true".equals(result)){bioMessage("Sign in to your Firebase account first.");return;}
            if(safePage())showSecurityPage();
        });
    }

    private LinearLayout sigColumn(){LinearLayout x=new LinearLayout(this);x.setOrientation(LinearLayout.VERTICAL);return x;}
    private LinearLayout sigRow(){LinearLayout x=new LinearLayout(this);x.setOrientation(LinearLayout.HORIZONTAL);x.setGravity(Gravity.CENTER_VERTICAL);return x;}
    private TextView sigText(String x,int sp,int color,boolean bold){TextView t=new TextView(this);t.setText(x);t.setTextSize(sp);t.setTextColor(color);t.setTypeface(android.graphics.Typeface.create("sans-serif",bold?android.graphics.Typeface.BOLD:android.graphics.Typeface.NORMAL));t.setIncludeFontPadding(false);return t;}
    private void sigSpace(LinearLayout l,int h){l.addView(new View(this),new LinearLayout.LayoutParams(1,dp(h)));}
    private void sigCenter(LinearLayout l,TextView t){t.setGravity(Gravity.CENTER);l.addView(t,new LinearLayout.LayoutParams(-1,-2));}
    private android.graphics.drawable.GradientDrawable sigShape(int bg,int stroke,int r){android.graphics.drawable.GradientDrawable d=new android.graphics.drawable.GradientDrawable();d.setColor(bg);d.setCornerRadius(dp(r));if(stroke!=0)d.setStroke(dp(1),stroke);return d;}
    private android.graphics.drawable.GradientDrawable sigGold(){android.graphics.drawable.GradientDrawable g=new android.graphics.drawable.GradientDrawable(android.graphics.drawable.GradientDrawable.Orientation.TL_BR,new int[]{0xffb57d20,0xffffdd81,0xffe4ad45,0xffbd8426});g.setCornerRadius(dp(14));g.setStroke(dp(1),0xffffda79);return g;}
    private TextView sigButton(String text,boolean primary,Runnable click){TextView t=sigText(text,15,primary?NIGHT:GOLD,true);t.setGravity(Gravity.CENTER);t.setPadding(dp(12),dp(14),dp(12),dp(14));t.setMinHeight(dp(48));t.setBackground(primary?sigGold():sigShape(0xff101f33,0xff9c7939,13));t.setOnClickListener(v->click.run());t.setFocusable(true);return t;}
    private EditText sigField(String hint,boolean pass){EditText f=new EditText(this);f.setSingleLine(true);f.setTextColor(PALE);f.setHintTextColor(SOFT);f.setHint(hint);f.setTextSize(15);f.setPadding(dp(12),0,dp(12),0);f.setBackgroundColor(Color.TRANSPARENT);f.setInputType(android.text.InputType.TYPE_CLASS_TEXT|(pass?android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD:android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS));f.setImeOptions(android.view.inputmethod.EditorInfo.IME_FLAG_NO_PERSONALIZED_LEARNING);if(pass){f.setTypeface(android.graphics.Typeface.DEFAULT);f.setTransformationMethod(android.text.method.PasswordTransformationMethod.getInstance());}return f;}
    private LinearLayout sigFieldRow(EditText field,String symbol,boolean eye){LinearLayout r=sigRow();r.setBackground(sigShape(0xff142236,0xff51627a,11));TextView ico=sigText(symbol,21,GOLD,true);ico.setGravity(Gravity.CENTER);r.addView(ico,new LinearLayout.LayoutParams(dp(44),-1));View separator=new View(this);separator.setBackgroundColor(0xff56647a);r.addView(separator,new LinearLayout.LayoutParams(dp(1),dp(22)));r.addView(field,new LinearLayout.LayoutParams(0,-1,1));if(eye){TextView show=sigText("◉",20,SOFT,false);show.setGravity(Gravity.CENTER);show.setContentDescription("Show password");show.setOnClickListener(v->{boolean reveal=field.getTransformationMethod()!=null;field.setTransformationMethod(reveal?null:android.text.method.PasswordTransformationMethod.getInstance());field.setSelection(field.length());show.setContentDescription(reveal?"Hide password":"Show password");});r.addView(show,new LinearLayout.LayoutParams(dp(44),-1));}return r;}
    private View sigBackdrop(){return new View(this){final android.graphics.Paint p=new android.graphics.Paint(3);protected void onDraw(android.graphics.Canvas c){float w=getWidth(),h=getHeight();p.setShader(new android.graphics.LinearGradient(0,0,w,h,new int[]{0xff111b25,NIGHT,0xff0b1c31,0xff030b15},null,android.graphics.Shader.TileMode.CLAMP));c.drawRect(0,0,w,h,p);p.setShader(new android.graphics.LinearGradient(0,0,w*.5f,h*.2f,new int[]{0xffa06d18,0xffffd776,0xff3c2b10},null,android.graphics.Shader.TileMode.CLAMP));android.graphics.Path top=new android.graphics.Path();top.moveTo(0,0);top.lineTo(w*.37f,0);top.quadTo(w*.12f,h*.055f,0,h*.17f);top.close();c.drawPath(top,p);p.setShader(new android.graphics.LinearGradient(w*.55f,h*.75f,w,h,new int[]{0xff201907,0xffffd776,0xff9a671e},null,android.graphics.Shader.TileMode.CLAMP));android.graphics.Path bot=new android.graphics.Path();bot.moveTo(w,h);bot.lineTo(w*.55f,h);bot.quadTo(w*.87f,h*.94f,w,h*.82f);bot.close();c.drawPath(bot,p);p.setShader(null);}};}
    private View sigFingerprint(boolean success){return new View(this){final android.graphics.Paint p=new android.graphics.Paint(3);protected void onDraw(android.graphics.Canvas c){float x=getWidth()/2f,y=getHeight()/2f,r=Math.min(x,y)*.76f;p.setStyle(android.graphics.Paint.Style.FILL);p.setShader(new android.graphics.RadialGradient(x,y,r*1.3f,new int[]{0x42e9b64d,0x00e9b64d},null,android.graphics.Shader.TileMode.CLAMP));c.drawCircle(x,y,r*1.3f,p);p.setShader(null);p.setColor(0xff101e2d);c.drawCircle(x,y,r,p);p.setStyle(android.graphics.Paint.Style.STROKE);p.setStrokeWidth(dp(3));p.setShader(new android.graphics.LinearGradient(x-r,y-r,x+r,y+r,new int[]{0xffffedaa,0xffb77f21,0xffffe18b},null,android.graphics.Shader.TileMode.CLAMP));if(success){p.setShader(null);p.setColor(0xff7cdaa1);}c.drawCircle(x,y,r,p);p.setShader(null);p.setColor(success?0xff7cdaa1:0xfff3ca71);p.setStrokeCap(android.graphics.Paint.Cap.ROUND);p.setStrokeJoin(android.graphics.Paint.Join.ROUND);c.save();c.translate(x,y);c.scale(r/31,r/31);p.setStrokeWidth(2.7f);android.graphics.Path a=new android.graphics.Path();if(success){a.moveTo(-14,0);a.lineTo(-4,10);a.lineTo(15,-13);}else{a.moveTo(-17,-12);a.quadTo(0,-30,17,-12);a.moveTo(-21,-2);a.cubicTo(-18,-24,18,-24,21,-2);a.moveTo(-18,10);a.lineTo(-18,-2);a.cubicTo(-18,-22,18,-22,18,-1);a.lineTo(18,9);a.moveTo(-11,18);a.quadTo(-16,9,-12,-2);a.cubicTo(-12,-15,12,-15,12,-2);a.quadTo(11,9,17,15);a.moveTo(-5,21);a.quadTo(-11,10,-6,0);a.cubicTo(-6,-9,6,-9,6,0);a.quadTo(4,11,12,20);a.moveTo(2,20);a.quadTo(-2,12,0,5);a.lineTo(0,-1);}c.drawPath(a,p);c.restore();}};}
    private void sigAddIcon(LinearLayout body,boolean done,int size,Runnable run){View v=sigFingerprint(done);LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(dp(size),dp(size));lp.gravity=Gravity.CENTER;body.addView(v,lp);v.setContentDescription("Fingerprint");if(run!=null){v.setOnClickListener(x->run.run());v.setFocusable(true);}}
    private void sigLogo(LinearLayout body){
        FrameLayout ring=new FrameLayout(this);ring.setBackground(sigGold());ring.setPadding(dp(4),dp(4),dp(4),dp(4));ring.setClipToOutline(true);android.graphics.drawable.GradientDrawable r=new android.graphics.drawable.GradientDrawable(android.graphics.drawable.GradientDrawable.Orientation.TL_BR,new int[]{0xffffeaa3,0xffb17d24,0xffffd574});r.setShape(android.graphics.drawable.GradientDrawable.OVAL);ring.setBackground(r);
        ImageView im=new ImageView(this);im.setImageResource(R.drawable.biki_icon);im.setScaleType(ImageView.ScaleType.FIT_CENTER);im.setBackground(sigShape(Color.WHITE,0,100));im.setClipToOutline(true);ring.addView(im,new FrameLayout.LayoutParams(-1,-1));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(dp(120),dp(120));p.gravity=Gravity.CENTER;body.addView(ring,p);sigSpace(body,13);
        TextView brand=sigText("BIKI ONLINE BILLING PRO",21,PALE,true);android.text.SpannableString b=new android.text.SpannableString(brand.getText());b.setSpan(new android.text.style.ForegroundColorSpan(GOLD),20,23,0);brand.setText(b);sigCenter(body,brand);sigSpace(body,7);TextView sub=sigText("PREMIUM BUSINESS MANAGEMENT",10,GOLD,true);sub.setLetterSpacing(.13f);sigCenter(body,sub);
    }
    private void showSignatureLogin(boolean passwordOnly){
        if(signatureRoot==null||signatureAuthorized)return;
        signatureShowingPassword=passwordOnly;
        if(signatureLogin!=null)signatureRoot.removeView(signatureLogin);
        FrameLayout stage=new FrameLayout(this);stage.setBackgroundColor(NIGHT);stage.addView(sigBackdrop(),new FrameLayout.LayoutParams(-1,-1));
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);scroll.setVerticalScrollBarEnabled(false);stage.addView(scroll,new FrameLayout.LayoutParams(-1,-1));LinearLayout body=sigColumn();body.setGravity(Gravity.CENTER_HORIZONTAL);body.setPadding(dp(22),dp(18),dp(22),dp(18));scroll.addView(body,new ScrollView.LayoutParams(-1,-2));sigLogo(body);sigSpace(body,20);
        final boolean quick=bioEnabled()&&!passwordOnly;
        if(quick){
            sigCenter(body,sigText("Welcome Back",24,PALE,true));sigSpace(body,7);sigCenter(body,sigText("Unlock your business workspace",13,SOFT,false));sigSpace(body,12);
            sigAddIcon(body,false,182,()->signatureBiometric());sigCenter(body,sigText("Login with Fingerprint",18,GOLD,true));sigSpace(body,8);sigCenter(body,sigText("Touch your fingerprint sensor",12,SOFT,false));sigSpace(body,22);body.addView(sigButton("Login with Password",false,()->showSignatureLogin(true)));
        }else{
            LinearLayout card=sigColumn();card.setPadding(dp(14),dp(15),dp(14),dp(15));card.setBackground(sigShape(0xff0e1b2b,0xffc59a46,17));body.addView(card,new LinearLayout.LayoutParams(-1,-2));
            EditText email=sigField("Email / User ID",false),password=sigField("Password",true);android.content.SharedPreferences pref=getSharedPreferences("signature_login",MODE_PRIVATE);email.setText(pref.getString("email",""));card.addView(sigFieldRow(email,"✉",false),new LinearLayout.LayoutParams(-1,dp(50)));sigSpace(card,10);card.addView(sigFieldRow(password,"♙",true),new LinearLayout.LayoutParams(-1,dp(50)));sigSpace(card,8);
            LinearLayout options=sigRow();CheckBox remember=new CheckBox(this);remember.setText("Remember me");remember.setTextSize(12);remember.setTextColor(PALE);remember.setButtonTintList(android.content.res.ColorStateList.valueOf(GOLD));remember.setChecked(pref.contains("email"));options.addView(remember,new LinearLayout.LayoutParams(0,-2,1));TextView forgot=sigText("Forgot Password?",12,GOLD,false);forgot.setPaintFlags(forgot.getPaintFlags()|android.graphics.Paint.UNDERLINE_TEXT_FLAG);forgot.setOnClickListener(v->signatureReset(email.getText().toString().trim()));options.addView(forgot);card.addView(options);sigSpace(card,8);
            card.addView(sigButton("SECURE LOGIN",true,()->{String e=email.getText().toString().trim(),p=password.getText().toString();if(e.isEmpty()||p.isEmpty()){signatureStatus("Enter your email and password.");return;}if(remember.isChecked())pref.edit().putString("email",e).apply();else pref.edit().remove("email").apply();password.setText("");signatureSubmit(e,p);}));
            sigSpace(body,12);sigCenter(body,sigText("────────  or  ────────",12,SOFT,false));sigAddIcon(body,false,108,()->signatureBiometric());TextView bi=sigText("Login with Fingerprint",16,PALE,true);sigCenter(body,bi);bi.setOnClickListener(v->signatureBiometric());sigSpace(body,5);sigCenter(body,sigText("Touch the fingerprint sensor",12,SOFT,false));if(bioEnabled()){sigSpace(body,10);body.addView(sigButton("Back to Fingerprint Login",false,()->showSignatureLogin(false)));}
        }
        sigSpace(body,13);signatureMessage=sigText(signatureAttempt?"Signing in…":"",12,0xffffd68b,false);signatureMessage.setGravity(Gravity.CENTER);body.addView(signatureMessage,new LinearLayout.LayoutParams(-1,-2));sigSpace(body,12);TextView foot=sigText("◇  Version V4.3  |  Secure & Private",11,GOLD,false);foot.setPadding(dp(14),dp(9),dp(14),dp(9));foot.setGravity(Gravity.CENTER);foot.setBackground(sigShape(NIGHT,0xffb78b36,30));body.addView(foot);sigSpace(body,10);stage.setFocusableInTouchMode(true);stage.requestFocus();signatureLogin=stage;signatureRoot.addView(stage,new FrameLayout.LayoutParams(-1,-1));
    }
    private void signatureStatus(String t){if(signatureMessage!=null)signatureMessage.setText(t);}
    private void signatureBiometric(){if(!bioEnabled()){signatureStatus("Sign in with password, then enable Fingerprint in Settings.");return;}if(!signatureReady){signatureStatus("Connecting to billing. Try again when ready.");return;}biometricLogin();}
    private void signatureReset(String email){if(email.isEmpty()){signatureStatus("Enter your email first.");return;}if(!safePage()||!signatureReady){signatureStatus("Connection not ready. Try again.");return;}new AlertDialog.Builder(this).setTitle("Reset password?").setMessage("Send a reset link to "+email+"?").setPositiveButton("Send",(d,w)->web.evaluateJavascript("(function(){try{firebase.auth().sendPasswordResetEmail("+JSONObject.quote(email)+").catch(()=>{});return true;}catch(e){return false;}})()",r->signatureStatus("If the account exists, check its email."))).setNegativeButton("Cancel",null).show();}
    private void signatureSubmit(String email,String password){
        if(signatureAttempt)return;if(!safePage()||!signatureReady){signatureStatus("Connecting to billing. Please try again.");if(failed&&web!=null)web.loadUrl(HOME);return;}signatureAttempt=true;signatureStatus("Signing in securely…");int g=++signatureGeneration;
        web.evaluateJavascript("(function(){try{if(!window.__bikiSignatureLogin)return false;return window.__bikiSignatureLogin("+JSONObject.quote(email)+","+JSONObject.quote(password)+");}catch(e){return false;}})()",r->{if(g!=signatureGeneration)return;if(!"true".equals(r)){signatureAttempt=false;signatureStatus("Login not ready. Check internet and retry.");return;}pollSignatureLogin(g,0);});
    }
    private void pollSignatureLogin(int generation,int count){if(generation!=signatureGeneration||!safePage())return;if(count>=120){signatureAttempt=false;signatureStatus("Cloud login timed out. Please retry.");return;}signatureHandler.postDelayed(()->{if(generation!=signatureGeneration||!safePage())return;web.evaluateJavascript("window.__bikiSignatureLoginState?window.__bikiSignatureLoginState():null",r->{if(generation!=signatureGeneration)return;try{JSONObject x=new JSONObject(r);String state=x.optString("state");if("ok".equals(state)){signatureAttempt=false;signatureAuthorized=true;web.setVisibility(View.VISIBLE);web.postVisualStateCallback(99,new WebView.VisualStateCallback(){@Override public void onComplete(long id){if(signatureAuthorized&&signatureLogin!=null&&signatureRoot!=null){signatureRoot.removeView(signatureLogin);signatureLogin=null;signatureMessage=null;}}});return;}if("error".equals(state)){signatureAttempt=false;signatureStatus("Login failed. Check email, password and cloud connection.");return;}}catch(Exception ignored){}pollSignatureLogin(generation,count+1);});},500);}
    private final Runnable signatureWatch=new Runnable(){public void run(){if(isFinishing()||isDestroyed())return;if(signatureAuthorized&&signatureReady&&safePage()){web.evaluateJavascript("window.__bikiSignatureAuthorized?window.__bikiSignatureAuthorized():false",r->{if(signatureAuthorized&&"false".equals(r)){signatureAuthorized=false;signatureAttempt=false;signatureGeneration++;web.setVisibility(View.INVISIBLE);showSignatureLogin(false);signatureStatus("Session ended. Sign in again.");}});}signatureHandler.postDelayed(this,700);}};
    private void showSecurityPage(){signatureSecurity(false);}
    private void signatureSecurity(boolean verify){
        final boolean enabled=bioEnabled();final android.app.Dialog dialog=new android.app.Dialog(this,android.R.style.Theme_Material_NoActionBar);
        FrameLayout root=new FrameLayout(this);root.setBackgroundColor(NIGHT);root.addView(sigBackdrop(),new FrameLayout.LayoutParams(-1,-1));ScrollView scroll=new ScrollView(this);root.addView(scroll,new FrameLayout.LayoutParams(-1,-1));LinearLayout body=sigColumn();body.setPadding(dp(22),dp(20),dp(22),dp(22));scroll.addView(body);
        LinearLayout header=sigRow();TextView back=sigText("‹",32,GOLD,true);back.setPadding(0,0,dp(12),0);back.setOnClickListener(v->dialog.dismiss());header.addView(back);LinearLayout name=sigColumn();name.addView(sigText("Fingerprint Setup",20,PALE,true));sigSpace(name,4);name.addView(sigText("BIKI ONLINE BILLING PRO",10,GOLD,true));header.addView(name,new LinearLayout.LayoutParams(0,-2,1));body.addView(header);sigSpace(body,18);sigAddIcon(body,enabled,175,null);
        sigCenter(body,sigText(enabled?"Fingerprint Enabled!":verify?"Verify Your Account":"Biometric Security",23,enabled?0xff83d9a5:PALE,true));sigSpace(body,10);sigCenter(body,sigText(enabled?"Your fingerprint login is active on this device.":verify?"Confirm your current login password.":"Enable fingerprint for fast and secure access to your business account.",13,SOFT,false));sigSpace(body,20);
        LinearLayout card=sigColumn();card.setPadding(dp(16),dp(18),dp(16),dp(18));card.setBackground(sigShape(PANEL,0xff806338,16));body.addView(card);
        if(enabled){for(String line:new String[]{"Fingerprint Login — Enabled","Current Device — Verified","Password Login — Available"}){card.addView(sigText("✓  "+line,14,PALE,false));sigSpace(card,14);}card.addView(sigButton("Test Fingerprint",false,()->{dialog.dismiss();testBiometric();}));sigSpace(card,10);card.addView(sigButton("Disable Fingerprint",false,()->new AlertDialog.Builder(this).setTitle("Disable fingerprint login?").setNegativeButton("Cancel",null).setPositiveButton("Disable",(d,w)->{eraseBio();dialog.dismiss();showSecurityPage();}).show()));sigSpace(body,15);body.addView(sigButton("DONE",true,()->dialog.dismiss()));}
        else if(verify){card.addView(sigText("Current Login Password",13,GOLD,true));sigSpace(card,10);EditText password=sigField("Enter password",true);card.addView(sigFieldRow(password,"♙",true),new LinearLayout.LayoutParams(-1,dp(50)));sigSpace(card,15);card.addView(sigButton("VERIFY & CONTINUE",true,()->{String p=password.getText().toString();if(p.isEmpty()){password.setError("Enter password");return;}password.setText("");dialog.dismiss();verifyEnrollment(p);}));dialog.setOnDismissListener(v->password.setText(""));}
        else{for(String line:new String[]{"Quick Fingerprint Login","Protected by Android Security","Password Login Available"}){card.addView(sigText("✓  "+line,14,PALE,false));sigSpace(card,14);}sigSpace(body,16);body.addView(sigButton("ENABLE FINGERPRINT",true,()->{dialog.dismiss();signatureSecurity(true);}));}
        sigSpace(body,24);sigCenter(body,sigText("◇  Version V4.3  |  Secure & Private",11,GOLD,false));dialog.setContentView(root);dialog.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);dialog.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);dialog.show();dialog.getWindow().setLayout(-1,-1);if(Build.VERSION.SDK_INT>=35){root.setOnApplyWindowInsetsListener((v,insets)->{android.graphics.Insets a=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout()|WindowInsets.Type.ime());v.setPadding(a.left,a.top,a.right,a.bottom);return insets;});root.requestApplyInsets();}
    }
    @Override protected void onDestroy(){signatureHandler.removeCallbacksAndMessages(null);super.onDestroy();}

    private void verifyEnrollment(String password){
        if(!safePage()||biometricBusy)return;biometricBusy=true;
        String marker=java.util.UUID.randomUUID().toString();
        String script="(function(){window.__bikiBioVerify={id:"+JSONObject.quote(marker)+",state:'pending'};try{const u=firebase.auth().currentUser;if(!u||!u.email||sessionStorage.getItem('biki_logged_in')!=='yes')throw Error('login required');const email=u.email;u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(email,"+JSONObject.quote(password)+")).then(()=>{window.__bikiBioVerify={id:"+JSONObject.quote(marker)+",state:'ok',email:email};}).catch(()=>{window.__bikiBioVerify={id:"+JSONObject.quote(marker)+",state:'error'};});}catch(e){window.__bikiBioVerify={id:"+JSONObject.quote(marker)+",state:'error'};}})()";
        web.evaluateJavascript(script,r->pollEnrollment(marker,password,0));
    }
    private void pollEnrollment(String marker,String password,int count){
        if(!safePage()||count>=60){biometricBusy=false;bioMessage("Verification could not finish. Try again.");return;}
        web.postDelayed(()->{
            if(!safePage()){biometricBusy=false;return;}
            web.evaluateJavascript("window.__bikiBioVerify&&window.__bikiBioVerify.id==="+JSONObject.quote(marker)+"?window.__bikiBioVerify:null",result->{
                try{
                    JSONObject r=new JSONObject(result);String state=r.optString("state");
                    if("ok".equals(state)){
                        String email=r.getString("email");web.evaluateJavascript("delete window.__bikiBioVerify",null);biometricBusy=false;
                        JSONObject credentials=new JSONObject();credentials.put("email",email);credentials.put("password",password);encryptBiometric(credentials.toString());
                    }else if("error".equals(state)){biometricBusy=false;web.evaluateJavascript("delete window.__bikiBioVerify",null);bioMessage("Password verification failed. Please check your Firebase password.");}
                    else pollEnrollment(marker,password,count+1);
                }catch(Exception e){pollEnrollment(marker,password,count+1);}
            });
        },500);
    }
    private interface BioSuccess{void done(Cipher cipher)throws Exception;}
    private void promptBio(Cipher cipher,String title,BioSuccess success){
        if(Build.VERSION.SDK_INT<28||biometricBusy)return;biometricBusy=true;
        try{
            BiometricPrompt.Builder builder=new BiometricPrompt.Builder(this).setTitle(title).setSubtitle("BIKI Billing PRO").setNegativeButton("Cancel",getMainExecutor(),(d,w)->{biometricBusy=false;});
            if(Build.VERSION.SDK_INT>=30)builder.setAllowedAuthenticators(android.hardware.biometrics.BiometricManager.Authenticators.BIOMETRIC_STRONG);
            BiometricPrompt prompt=builder.build();
            prompt.authenticate(new BiometricPrompt.CryptoObject(cipher),new CancellationSignal(),getMainExecutor(),new BiometricPrompt.AuthenticationCallback(){
                @Override public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result){
                    biometricBusy=false;try{Cipher c=result.getCryptoObject().getCipher();if(c==null)throw new IllegalStateException();success.done(c);}catch(Exception e){bioMessage("Fingerprint operation failed. Use password login.");}
                }
                @Override public void onAuthenticationError(int code,CharSequence message){biometricBusy=false;bioMessage(message.toString());}
                @Override public void onAuthenticationFailed(){bioMessage("Fingerprint not recognized. Try again.");}
            });
        }catch(Exception e){biometricBusy=false;bioMessage("Set up a supported fingerprint in Android Settings first.");}
    }
    private void encryptBiometric(String credentials){
        if(Build.VERSION.SDK_INT<28||!safePage())return;
        try{
            eraseBio();
            KeyGenerator kg=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
            KeyGenParameterSpec.Builder spec=new KeyGenParameterSpec.Builder(BIO_KEY,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setUserAuthenticationRequired(true).setInvalidatedByBiometricEnrollment(true);
            if(Build.VERSION.SDK_INT>=30)spec.setUserAuthenticationParameters(0,KeyProperties.AUTH_BIOMETRIC_STRONG);
            else spec.setUserAuthenticationValidityDurationSeconds(-1);
            kg.init(spec.build());SecretKey key=kg.generateKey();
            Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,key);
            promptBio(c,"Enable fingerprint login",authenticated->{
                byte[] encrypted=authenticated.doFinal(credentials.getBytes(StandardCharsets.UTF_8));
                bioPrefs().edit().putString("cipher",Base64.encodeToString(encrypted,Base64.NO_WRAP))
                    .putString("iv",Base64.encodeToString(authenticated.getIV(),Base64.NO_WRAP)).apply();
                refreshBioUi();showSecurityPage();bioMessage("Fingerprint login enabled.");
            });
        }catch(Exception e){eraseBio();bioMessage("Fingerprint setup unavailable. Enroll a fingerprint in Android Settings.");}
    }
    private void testBiometric(){
        if(Build.VERSION.SDK_INT<28||!bioEnabled()||!safePage())return;
        try{
            KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);
            SecretKey key=(SecretKey)ks.getKey(BIO_KEY,null);
            Cipher c=Cipher.getInstance("AES/GCM/NoPadding");
            c.init(Cipher.DECRYPT_MODE,key,new GCMParameterSpec(128,Base64.decode(bioPrefs().getString("iv",""),Base64.NO_WRAP)));
            promptBio(c,"Test fingerprint",authenticated->{byte[] plain=authenticated.doFinal(Base64.decode(bioPrefs().getString("cipher",""),Base64.NO_WRAP));java.util.Arrays.fill(plain,(byte)0);bioMessage("Fingerprint test successful.");});
        }catch(Exception e){eraseBio();bioMessage("Security changed. Enable fingerprint again.");}
    }
    private void biometricLogin(){
        if(Build.VERSION.SDK_INT<28||!bioEnabled()||!safePage()){bioMessage("Enable fingerprint login from My Account after signing in.");return;}
        try{
            KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);
            SecretKey key=(SecretKey)ks.getKey(BIO_KEY,null);if(key==null)throw new IllegalStateException();
            Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,key,new GCMParameterSpec(128,Base64.decode(bioPrefs().getString("iv",""),Base64.NO_WRAP)));
            promptBio(c,"Sign in with fingerprint",authenticated->{
                byte[] plain=authenticated.doFinal(Base64.decode(bioPrefs().getString("cipher",""),Base64.NO_WRAP));
                JSONObject credentials=new JSONObject(new String(plain,StandardCharsets.UTF_8));java.util.Arrays.fill(plain,(byte)0);
                if(!safePage())return;
                String email=JSONObject.quote(credentials.getString("email")),password=JSONObject.quote(credentials.getString("password"));
                signatureSubmit(credentials.getString("email"),credentials.getString("password"));
            });
        }catch(Exception e){eraseBio();bioMessage("Fingerprint security changed. Sign in with password and enable again.");}
    }

    @Override protected void onActivityResult(int request,int result,Intent data){
        super.onActivityResult(request,result,data);
        if(request==PICK && files!=null){files.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data)); files=null;}
    }
    @Override protected void onSaveInstanceState(Bundle out){if(web!=null)web.saveState(out);super.onSaveInstanceState(out);}
    @Override public void onBackPressed(){if(web==null){super.onBackPressed();return;}web.evaluateJavascript("typeof window.__bikiNativeBack==='function' && window.__bikiNativeBack()",result->{if(!"true".equals(result)){if(web!=null&&web.canGoBack())web.goBack();else Toast.makeText(this,"Use Home to return to dashboard",Toast.LENGTH_SHORT).show();}});}
}
