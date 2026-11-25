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
    private static final String HOME = "https://bali9900.github.io/Biki-Billing/";
    private static final int PICK = 44;
    private WebView web;
    private ProgressBar progress;
    private ValueCallback<Uri[]> files;
    private String retryUrl = HOME;
    private boolean failed = false;
    private boolean biometricBusy=false;
    private static final String BIO_KEY="biki_biometric_v1";
    private static final String BIO_PREF="biki_biometric_private";
    private int dp(int v) { return (int)(v * getResources().getDisplayMetrics().density + .5f); }
    private boolean inside(Uri u) {
        String p = u.getPath();
        return "https".equalsIgnoreCase(u.getScheme()) && "bali9900.github.io".equalsIgnoreCase(u.getHost())
            && p != null && (p.equals("/Biki-Billing") || p.startsWith("/Biki-Billing/"));
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
        getWindow().setStatusBarColor(0xFF102951);
        getWindow().setNavigationBarColor(0xFFFFFFFF);
        int flags=0;
        if(Build.VERSION.SDK_INT>=26)flags|=View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        getWindow().getDecorView().setSystemUiVisibility(flags);
        FrameLayout root=new FrameLayout(this);
        root.setBackgroundColor(0xFFF1F5FA);
        web=new WebView(this);web.setBackgroundColor(0xFFF1F5FA);web.setVisibility(View.INVISIBLE);
        root.addView(web,new FrameLayout.LayoutParams(-1,-1));
        progress=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);
        root.addView(progress,new FrameLayout.LayoutParams(-1,dp(2),Gravity.TOP));
        setContentView(root);
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
        s.setUseWideViewPort(true); s.setLoadWithOverviewMode(false); s.setCacheMode(WebSettings.LOAD_DEFAULT);
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
                if(inside(Uri.parse(url))) {retryUrl=url; failed=false;} progress.setVisibility(View.VISIBLE);
            }
            @Override public void onPageFinished(WebView v,String url){if(inside(Uri.parse(url)))injectV2();}
            @Override public void onReceivedError(WebView v,WebResourceRequest r,WebResourceError e){
                if(r.isForMainFrame()) { v.setVisibility(View.VISIBLE); failed=true; new AlertDialog.Builder(MainActivity.this).setTitle("Connection problem").setMessage("Check your internet connection and try again.").setPositiveButton("Retry",(d,w)->v.loadUrl(retryUrl)).setNegativeButton("Close",null).show(); }
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
                h.cancel();v.setVisibility(View.VISIBLE); Toast.makeText(MainActivity.this,"Secure connection failed",Toast.LENGTH_LONG).show();
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
        if(state==null || web.restoreState(state)==null) web.loadUrl(HOME);
    }
    private void showStartupError(RuntimeException e){
        LinearLayout panel=new LinearLayout(this);panel.setOrientation(LinearLayout.VERTICAL);panel.setGravity(Gravity.CENTER);panel.setPadding(dp(24),dp(24),dp(24),dp(24));panel.setBackgroundColor(0xFFF1F5FA);
        TextView title=new TextView(this);title.setText("BIKI Billing PRO");title.setTextColor(0xFF102951);title.setTextSize(24);panel.addView(title);
        TextView message=new TextView(this);message.setText("App startup could not complete. Update Android System WebView and try again.\n"+e.getClass().getSimpleName());message.setPadding(0,dp(16),0,dp(16));panel.addView(message);
        Button retry=new Button(this);retry.setText("Retry");retry.setOnClickListener(v->recreate());panel.addView(retry);
        Button browser=new Button(this);browser.setText("Open website");browser.setOnClickListener(v->external(Uri.parse(HOME)));panel.addView(browser);
        setContentView(panel);
    }
    private void injectV2(){
        try(InputStream in=getAssets().open("native-v2.js");ByteArrayOutputStream out=new ByteArrayOutputStream()){
            byte[] buffer=new byte[8192];int n;while((n=in.read(buffer))!=-1)out.write(buffer,0,n);
            web.evaluateJavascript(new String(out.toByteArray(),StandardCharsets.UTF_8),result->{if(web!=null)web.setVisibility(View.VISIBLE);refreshBioUi();});
        }catch(IOException e){if(web!=null)web.setVisibility(View.VISIBLE);Toast.makeText(this,"App theme could not load",Toast.LENGTH_SHORT).show();}
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
    private void biometricSettings(){
        if(Build.VERSION.SDK_INT<28){bioMessage("Fingerprint login requires Android 9 or later.");return;}
        if(bioEnabled()){
            new AlertDialog.Builder(this).setTitle("Fingerprint login").setMessage("Fingerprint login is enabled on this device.")
                .setPositiveButton("Done",null).setNeutralButton("Test fingerprint",(d,w)->testBiometric()).setNegativeButton("Disable",(d,w)->{eraseBio();bioMessage("Fingerprint login disabled.");}).show();return;
        }
        if(!safePage())return;
        web.evaluateJavascript("(function(){try{return sessionStorage.getItem('biki_logged_in')==='yes' && !!firebase.auth().currentUser && document.getElementById('bikiCloudGate').style.display==='none';}catch(e){return false;}})()",result->{
            if(!"true".equals(result)){bioMessage("Sign in to your Firebase account first.");return;}
            if(!safePage())return;
            LinearLayout form=new LinearLayout(this);form.setOrientation(LinearLayout.VERTICAL);form.setPadding(dp(20),dp(8),dp(20),0);
            TextView hint=new TextView(this);hint.setText("Confirm your current Firebase password once. It will be encrypted with Android Keystore and unlocked only after biometric authentication.");form.addView(hint);
            EditText pass=new EditText(this);pass.setHint("Firebase password");pass.setInputType(android.text.InputType.TYPE_CLASS_TEXT|android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);pass.setTransformationMethod(android.text.method.PasswordTransformationMethod.getInstance());pass.setSingleLine(true);pass.setTypeface(android.graphics.Typeface.DEFAULT);pass.setImeOptions(android.view.inputmethod.EditorInfo.IME_FLAG_NO_PERSONALIZED_LEARNING);form.addView(pass); CheckBox reveal=new CheckBox(this);reveal.setText("Show password");reveal.setOnCheckedChangeListener((button,checked)->{pass.setTransformationMethod(checked?null:android.text.method.PasswordTransformationMethod.getInstance());pass.setSelection(pass.length());});form.addView(reveal); TextView security=new TextView(this);security.setText("Android Keystore • Encrypted credentials\nFingerprint data stays on your device");security.setTextColor(Color.rgb(30,90,150));security.setPadding(0,dp(16),0,dp(12));form.addView(security);
            AlertDialog dialog=new AlertDialog.Builder(this).setTitle("Enable fingerprint login").setView(form).setNegativeButton("Cancel",null).setPositiveButton("Verify",null).create();
            dialog.getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);dialog.setOnDismissListener(v->pass.setText(""));dialog.setOnShowListener(v->dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(b->{
                String password=pass.getText().toString();if(password.isEmpty()){pass.setError("Enter password");return;}pass.setText("");dialog.dismiss();verifyEnrollment(password);
            }));dialog.show();
        });
    }
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
                refreshBioUi();bioMessage("Fingerprint login enabled.");
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
                web.evaluateJavascript("(function(){if(typeof window.__bikiFingerprintSubmit==='function')return window.__bikiFingerprintSubmit("+email+","+password+");return false;})()",result->{if(!"true".equals(result))bioMessage("Login page is not ready. Please use password login.");});
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
