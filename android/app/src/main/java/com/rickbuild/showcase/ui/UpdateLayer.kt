package com.rickbuild.showcase.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.rickbuild.showcase.data.Release
import com.rickbuild.showcase.data.Services
import com.rickbuild.showcase.ui.theme.Palette
import com.rickbuild.showcase.updates.UpdateState
import kotlinx.coroutines.launch

/*
  The update offer, above every screen. Checks the website each time the app
  comes to the front. A mandatory update covers the app until it's installed.
*/
@Composable
fun UpdateLayer(modifier: Modifier = Modifier) {
    val updater = Services.updater ?: return
    val state by updater.state.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) { scope.launch { updater.check() } }

    fun install(release: Release) = scope.launch { updater.downloadAndInstall(release) }

    when (val s = state) {
        UpdateState.Idle -> Unit
        is UpdateState.Available -> if (s.mandatory) {
            MandatoryCover(s.release) { install(s.release) }
        } else {
            UpdateCard(modifier, "Version ${s.release.versionName} is ready", s.release.notes) {
                GhostButton("Later") { updater.dismiss() }
                PrimaryButton("Update") { install(s.release) }
            }
        }
        is UpdateState.Downloading -> UpdateCard(modifier, "Downloading ${s.release.versionName}…", null) {
            Column(Modifier.fillMaxWidth()) {
                LinearProgressIndicator(
                    progress = { s.progress },
                    color = Palette.Live,
                    trackColor = Palette.Line,
                    modifier = Modifier.fillMaxWidth().height(4.dp).clip(RoundedCornerShape(2.dp)),
                )
                Spacer(Modifier.height(6.dp))
                Text("${(s.progress * 100).toInt()}%", style = MaterialTheme.typography.labelSmall, color = Palette.Muted)
            }
        }
        is UpdateState.Installing -> UpdateCard(modifier, "Installing ${s.release.versionName}…", "Android will ask you to confirm.") {}
        is UpdateState.NeedsPermission -> UpdateCard(
            modifier,
            "Allow updates",
            "To install its own updates, Rick.build needs \"Install unknown apps\". On Redmi and Xiaomi phones the switch is called \"Allow from this source\".",
        ) {
            GhostButton("Later") { updater.dismiss() }
            PrimaryButton("Allow") { context.startActivity(updater.permissionIntent()) }
        }
        is UpdateState.Failed -> UpdateCard(modifier, "The update didn't finish", failureText(s.reason)) {
            GhostButton("Later") { updater.dismiss() }
            PrimaryButton("Try again") { install(s.release) }
        }
    }
}

private fun failureText(reason: String) = when {
    reason == "offline" -> "No connection. Check your internet and try again."
    reason == "checksum" -> "The download was damaged on the way, so it wasn't installed."
    reason == "aborted" -> "The install was cancelled."
    reason.startsWith("download_") -> "The download didn't work (${reason.removePrefix("download_")})."
    else -> "Android couldn't install it ($reason)."
}

@Composable
private fun UpdateCard(
    modifier: Modifier,
    title: String,
    body: String?,
    actions: @Composable () -> Unit,
) {
    val shape = RoundedCornerShape(18.dp)
    Column(
        modifier.padding(12.dp).widthIn(max = 560.dp).fillMaxWidth().clip(shape).background(Palette.Surface2)
            .border(1.dp, Palette.Live.copy(alpha = 0.35f), shape).padding(18.dp).testTag("update-card"),
    ) {
        Text(title, style = MaterialTheme.typography.titleMedium)
        if (!body.isNullOrBlank()) {
            Spacer(Modifier.height(4.dp))
            Text(body, style = MaterialTheme.typography.bodyMedium, color = Palette.Muted, maxLines = 4, overflow = TextOverflow.Ellipsis)
        }
        Spacer(Modifier.height(14.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.End), verticalAlignment = Alignment.CenterVertically) {
            actions()
        }
    }
}

@Composable
private fun MandatoryCover(release: Release, onUpdate: () -> Unit) {
    Box(
        Modifier.fillMaxSize().background(Palette.Ink.copy(alpha = 0.97f))
            // Swallow taps so the app behind can't be used until it's updated.
            .clickable(interactionSource = remember { MutableInteractionSource() }, indication = null) {}
            .padding(32.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Eyebrow("Update required", color = Palette.Live)
            Spacer(Modifier.height(12.dp))
            Text("Please update to ${release.versionName}", style = MaterialTheme.typography.headlineMedium, textAlign = TextAlign.Center)
            if (release.notes.isNotBlank()) {
                Spacer(Modifier.height(10.dp))
                Text(release.notes, style = MaterialTheme.typography.bodyLarge, color = Palette.Muted, textAlign = TextAlign.Center)
            }
            Spacer(Modifier.height(24.dp))
            PrimaryButton("Update now", onClick = onUpdate)
        }
    }
}
