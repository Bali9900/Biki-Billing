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

public class MainActivity extends Activity {
    private static final String HOME = "https://bali9900.github.io/Biki-Billing/";
    private static final int PICK = 44;
    private WebView web;
    private ProgressBar progress;
    private ValueCallback<Uri[]> files;
    private String retryUrl = HOME;
    private boolean failed = false;
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
            web.evaluateJavascript(new String(out.toByteArray(),StandardCharsets.UTF_8),result->{if(web!=null)web.setVisibility(View.VISIBLE);});
        }catch(IOException e){if(web!=null)web.setVisibility(View.VISIBLE);Toast.makeText(this,"App theme could not load",Toast.LENGTH_SHORT).show();}
    }
    private boolean nativeAction(Uri u){
        if(!"bikiapp".equals(u.getScheme()))return false;
        if(web.getUrl()==null||!inside(Uri.parse(web.getUrl())))return true;
        String action=u.getHost();
        if("reload".equals(action)){if(failed)web.loadUrl(retryUrl);else web.reload();}
        else if("browser".equals(action))external(Uri.parse(HOME));
        else if("print".equals(action)){PrintManager pm=(PrintManager)getSystemService(PRINT_SERVICE);pm.print("BIKI Billing",web.createPrintDocumentAdapter("BIKI Billing"),null);}
        return true;
    }
    @Override protected void onActivityResult(int request,int result,Intent data){
        super.onActivityResult(request,result,data);
        if(request==PICK && files!=null){files.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,data)); files=null;}
    }
    @Override protected void onSaveInstanceState(Bundle out){if(web!=null)web.saveState(out);super.onSaveInstanceState(out);}
    @Override public void onBackPressed(){if(web==null){super.onBackPressed();return;}web.evaluateJavascript("typeof window.__bikiNativeBack==='function' && window.__bikiNativeBack()",result->{if(!"true".equals(result)){if(web!=null&&web.canGoBack())web.goBack();else super.onBackPressed();}});}
}
