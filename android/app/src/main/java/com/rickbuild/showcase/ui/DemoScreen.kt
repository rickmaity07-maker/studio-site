package com.rickbuild.showcase.ui

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.rickbuild.showcase.ui.theme.Palette

/*
  The live client site, full screen. A WebView loads it as a normal page, so it
  works even for sites that refuse to be embedded in an iframe on the website.
*/
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun DemoScreen(vm: AppViewModel, slug: String) {
    val project = vm.project(slug)
    val liveUrl = project?.liveUrl ?: return ErrorState("This demo isn't available.") { vm.back() }
    val context = LocalContext.current
    val uriHandler = LocalUriHandler.current

    var progress by remember { mutableFloatStateOf(0f) }
    var loading by remember { mutableStateOf(true) }
    var address by remember { mutableStateOf(project.displayUrl) }
    var canGoBack by remember { mutableStateOf(false) }

    val webView = remember {
        WebView(context).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.mediaPlaybackRequiresUserGesture = true
            setBackgroundColor(android.graphics.Color.parseColor("#0B0D12"))
            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
                    loading = true
                    address = url.removePrefix("https://").removePrefix("http://").trimEnd('/')
                }

                override fun onPageFinished(view: WebView, url: String) {
                    loading = false
                    canGoBack = view.canGoBack()
                }
            }
            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView, newProgress: Int) {
                    progress = newProgress / 100f
                }
            }
            loadUrl(liveUrl)
        }
    }

    DisposableEffect(webView) {
        onDispose { webView.destroy() }
    }

    // Back walks the demo's own history first, then closes it.
    BackHandler(enabled = canGoBack) {
        webView.goBack()
        canGoBack = webView.canGoBack()
    }

    Column(Modifier.fillMaxSize().background(Palette.Ink).windowInsetsPadding(WindowInsets.safeDrawing)) {
        ChromeBar(address) {
            BarButton("↗") { uriHandler.openUri(webView.url ?: liveUrl) }
            BarButton("✕") { vm.back() }
        }
        Box(Modifier.fillMaxWidth().height(2.dp)) {
            if (loading) {
                LinearProgressIndicator(
                    progress = { progress },
                    color = Palette.Live,
                    trackColor = Palette.Surface2,
                    modifier = Modifier.fillMaxSize(),
                )
            }
        }
        AndroidView(factory = { webView }, modifier = Modifier.fillMaxSize())
    }
}

@Composable
private fun BarButton(glyph: String, onClick: () -> Unit) {
    Text(
        glyph,
        fontSize = 16.sp,
        color = Palette.Text,
        modifier = Modifier.clip(CircleShape).clickable(onClick = onClick).padding(horizontal = 10.dp, vertical = 4.dp),
    )
}
